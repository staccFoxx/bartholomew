@echo off
title CypherVoice Desktop Companion v0.7.3
echo ==================================================================
echo           CYPHERVOICE DESKTOP COMPANION LAUNCHER v0.7.3           
echo ==================================================================
python "%~dp0scripts\cyphervoice_launcher.py" %*
if errorlevel 1 pause
