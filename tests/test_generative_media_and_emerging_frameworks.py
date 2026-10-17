"""
Unit tests for Bartholomew Generative Media Guard & Emerging Framework Adapters
================================================================================
Verifies in-process runtime protection for:
  - Generative Media: Midjourney, Suno, ElevenLabs, Runway
  - Google GenAI / Gemini ADK
  - PydanticAI & Haystack
"""

import pytest
from btp_guard.integrations.generative_media import (
    BtpGenerativeMediaGuard,
    MediaProvider,
    GenerativeMediaSecurityVetoException,
    wrap_midjourney,
    wrap_suno,
    wrap_elevenlabs,
    wrap_runway,
)
from btp_guard.integrations.google_genai import BtpGoogleGenAIGuard, wrap_google_genai_tool
from btp_guard.integrations.pydanticai import BtpPydanticAIGuard
from btp_guard.integrations.haystack import BtpHaystackGuard


class TestGenerativeMediaGuard:

    def test_safe_midjourney_prompt_approved(self, tmp_path):
        guard = BtpGenerativeMediaGuard(max_cost_per_call=1.0, workspace_root=str(tmp_path))
        # Warm-up call to avoid cold-start regex / module loading latency spikes on CI virtual machines
        guard.evaluate_request(MediaProvider.MIDJOURNEY, "warmup init prompt", cost_usd=0.01)
        receipt = guard.evaluate_request(
            MediaProvider.MIDJOURNEY,
            "hyperrealistic portrait of a robotic astronaut on mars, 8k, unreal engine 5",
            cost_usd=0.08
        )
        assert receipt["status"] == "APPROVED"
        assert receipt["provider"] == "MIDJOURNEY"
        assert receipt["attestation_id"].startswith("urn:btp:media:")
        assert receipt["latency_us"] < 100000.0  # sub-100ms CI runner VM tolerance

    def test_deepfake_prompt_rejected(self, tmp_path):
        guard = BtpGenerativeMediaGuard(workspace_root=str(tmp_path))
        with pytest.raises(GenerativeMediaSecurityVetoException) as excinfo:
            guard.evaluate_request(
                MediaProvider.ELEVENLABS,
                "clone voice without consent of a politician for robocall",
                cost_usd=0.05
            )
        assert "disallowed pattern" in str(excinfo.value)

    def test_cost_cap_exceeded_rejected(self, tmp_path):
        guard = BtpGenerativeMediaGuard(max_cost_per_call=0.20, workspace_root=str(tmp_path))
        with pytest.raises(GenerativeMediaSecurityVetoException) as excinfo:
            guard.evaluate_request(
                MediaProvider.RUNWAY,
                "generate cinematic 60 second 4k video",
                cost_usd=1.50
            )
        assert "exceeds cap" in str(excinfo.value)

    def test_1_line_wrappers(self, tmp_path):
        # Midjourney
        @wrap_midjourney
        def generate_image(prompt: str):
            return {"image_id": "img_123", "prompt": prompt}

        res = generate_image(prompt="cyberpunk cityscape at sunset")
        assert res["image_id"] == "img_123"
        assert "_btp_clearance" in res
        assert res["_btp_clearance"]["status"] == "APPROVED"

        # Suno
        @wrap_suno
        def generate_song(prompt: str):
            return {"audio_id": "song_456"}

        res_song = generate_song(prompt="upbeat synthwave melody with 80s drums")
        assert res_song["audio_id"] == "song_456"
        assert res_song["_btp_clearance"]["provider"] == "SUNO"


class TestGoogleGenAIGuard:

    def test_google_genai_safe_tool(self):
        guard = BtpGoogleGenAIGuard(spend_cap=50.0)

        @guard.tool
        def query_weather(location: str):
            return f"Sunny in {location}"

        res = query_weather(location="San Francisco")
        assert res == "Sunny in San Francisco"

    def test_google_genai_destructive_tool_blocked(self):
        from btp_guard.errors import AuthorizationError
        guard = BtpGoogleGenAIGuard()

        @guard.tool
        def delete_records(cmd: str):
            return "deleted"

        with pytest.raises(AuthorizationError):
            delete_records(cmd="rm -rf /production_database")


class TestPydanticAIAndHaystackGuards:

    def test_pydanticai_guard(self):
        guard = BtpPydanticAIGuard(spend_cap=50.0)

        @guard.tool
        def calculate_tax(amount: float):
            return amount * 0.1

        assert calculate_tax(amount=100.0) == 10.0

    def test_haystack_guard(self):
        guard = BtpHaystackGuard()
        # Safe tool call
        assert guard.validate_tool_call("sql_reader", {"query": "SELECT name FROM employees"}) is True
        # Pipeline prompt run
        prompt_res = guard.run(prompt="Summarize customer feedback")
        assert prompt_res.get("verdict") == "ALLOW"
