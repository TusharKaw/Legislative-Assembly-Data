#!/bin/bash
echo "═══════════════════════════════════════════════════════════"
echo "  📱 EXPO OUTPUT - Refresh this to see updates"
echo "═══════════════════════════════════════════════════════════"
echo ""
tail -60 /tmp/expo-output.txt 2>/dev/null || echo "Expo output not found. Run: cd mobile && npx expo start"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "To see live updates, run: watch -n 2 'tail -60 /tmp/expo-output.txt'"
