# Steganography Application

This project is a modern steganography application developed as a school assignment for the ENC-K - Kryptologie course at Mendel University in Brno. The application allows users to hide and reveal information in various types of media: text, images, audio, and video.

## About the Project

This application was created as a fulfillment of the course requirement to implement a non-trivial application using steganographic methods in a programming language suitable for the task. While JavaScript might not be the most efficient language for implementing steganographic algorithms (compared to languages like Python), it was chosen to explore a different approach than what is commonly used by others in the course.

## Main Features

- **Multiple Steganographic Methods**: The application supports various methods for each media type:

  - **Text**: Delimiters, Base64 + Delimiters, White Spaces, Zero-width characters, Bacon cipher, Multi-tag Bacon cipher, Similar letters, Czech conjunctions, Word spacing
  - **Images**: LSB (Least Significant Bit) steganography with customizable bit depth
  - **Audio**: LSB audio steganography in WAV files
  - **Video**: Frame-based steganography with individual frame extraction and processing

- **Encryption Support**: Option to encrypt hidden messages using AES-128 or AES-256 (except for audio and video)
- **Status Messages and Visualizations**: The application displays graphical outputs, previews, and success or error notifications
- **Result Downloads**: Resulting images, audio, and video frames can be downloaded with custom names
- **Clipboard and Import Support**: Support for pasting and importing text/files from clipboard or file system

## Important Limitations and Warnings

- **UTF-8 and Czech Character Support**: Some methods (especially text-based) fully support UTF-8 and Czech characters, while others (e.g., audio, some image methods) only support ASCII. A warning is displayed when entering Czech characters.
- **Automatic Image Resizing**: When hiding an image within another image, the secret image is automatically resized if it's too large. This feature may not always be 100% reliable and could result in loss of detail.
- **Audio and Video**: If you download audio with a hidden message and upload it again, the message may be lost due to compression (especially with MP3). For best results, use WAV. With low-quality or highly compressed video and audio, it may not be possible to successfully hide or reveal a message.

## Technologies

- **Vue 3** – modern framework for building user interfaces
- **Vite** – fast development and build tool
- **Vuetify** – component library for modern design

## Installation

1. Clone the repository:
   ```
   git clone <repo-url>
   ```
2. Navigate to the project directory:
   ```
   cd steganographic_project
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Running the Application

To run in development mode:

```
npm run dev
```

## Production Build

To create a production build:

```
npm run build
```

## Contributing

Suggestions for improvements or bug fixes are welcome in the form of pull requests.

## License

MIT

## Acknowledgements

This project was developed as part of the ENC-K - Kryptologie course at Mendel University in Brno. Special thanks to the course instructors for their guidance and support.
