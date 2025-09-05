# **App Name**: QuizPoint Central

## Core Features:

- Interface Selection: Allow users to choose between 'Monitor' and 'Primary (Scoring)' interfaces upon opening the webapp.
- Device Verification: If 'Primary' is selected, generate a 6-digit verification code for authentication with the 'Monitor' interface. And also a button to generate new code.
- Team Setup: After successful verification, prompt the user to input the number of participating teams. Display team numbers as column headers.
- Scoring Grid: Display a grid with team numbers as column headers and question numbers as row labels.
- Point Input: Provide point buttons ranging from -10 to +20 (incrementing by 5) at the bottom of the 'Primary' interface. Current scoring cell will highlight and will go to the next team when score button pressed.
- Score Submissions: Real-time score submissions. Score information is sent to monitor display upon completion of question. A progress bar helps the proctor know if each score has been received from the audience.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5). Indigo projects trust, wisdom, and stability; it works nicely for education and quiz environments.
- Background color: Very light indigo (#E8EAF6). It will provide a calm atmosphere.
- Accent color: Violet (#9C27B0). This contrasting color creates energy and supports readability of prominent features.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body.
- Use clear, simple icons for interface selection (monitor vs. primary) and any interactive elements. Icons should be consistent in style and size.
- Use a clean, grid-based layout to present the scoring information. The primary interface should be optimized for quick input and clear feedback.
- Use subtle animations to provide feedback on button presses and highlight the active scoring cell. Avoid distracting or unnecessary animations.