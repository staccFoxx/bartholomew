from setuptools import setup, find_packages

setup(
    name="btp-guard",
    version="7.0.4",
    author="Bartholomew Security Contributors",
    author_email="help@bartholomew.info",
    description="Sub-millisecond OWASP LLM Top 10 Security Guard, Prompt Token Tollbooth & Sovereign AST Gateway for AI Agents",
    long_description=open("README.md", "r", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/staccFoxx/bartholomew",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
        "Topic :: Software Development :: Quality Assurance",
        "Topic :: Security",
    ],
    python_requires=">=3.10",
    install_requires=[
        "cryptography>=41.0.0"
    ],
    entry_points={
        "console_scripts": [
            "btp-guard=bartholomew_eval.cli:main",
            "btp-tollbooth=bartholomew_eval.tollbooth:run_tollbooth_server",
            "bartholomew=bartholomew_eval.cli:main",
            "bartholomew-eval=bartholomew_eval.cli:main",
            "bartholomew-verify=bartholomew_eval.attestation_verifier:main",
            "bartholomew-scout=bartholomew_eval.agent_scouter:main",
            "bartholomew-swarm=bartholomew_eval.swarm_federation:main",
        ],
    },
)
