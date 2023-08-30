# Transcribe & Translate Tool (TT-Tool)

## Introduction

The `Transcribe & Translate Tool (TT-Tool` is a simple [NodeGUI](https://docs.nodegui.org/) UI for transcribing of audio/video files into subtitle/text and automatic machine translation of the transcribed files or separate ones. The transcribing process is using [OpenAI Whisper](https://openai.com/research/whisper) and the translation one is using the [DeepL Engine](https://www.deepl.com/whydeepl). Both processes are independent from each other, however at the moment only one can run at a time.

## Requirements

The following two things are required before you can use the `tt-tool`:

- Whisper Command-Line Interface (CLI) in order to do the transcribing. You have the following two options to choose from:
  - The C++ port of the official [OpenAI Whisper in Python](https://github.com/openai/whisper) called [Whisper.cpp](https://github.com/ggerganov/whisper.cpp).
  - [Windows port of Whisper.cpp](https://github.com/Const-me/Whisper) with GPU acceleration support.

  As of now the last two works faster than the original Python implementation. This will certainly change with time.
Download the Whisper CLI from one of the options above and save it in a dedicated folder, preferably into the folder where the `tt-tool` is located. You can configure the exact location into the `tt-tool` itself.

- DeepL API or Authentication Key - it can be obtained as described in the [official DeepL Documentation](https://support.deepl.com/hc/en-us/articles/360020695820-Authentication-Key).

## Running from the source and setting-up development environment

Make sure you have met the [NodeGUI requirements](https://docs.nodegui.org/docs/guides/getting-started#developer-environment).

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

From the command line, execute as follows:

```console
# Clone this repository
git clone https://github.com/milkotodorov/tt-tool

# Go into the repository
cd tt-tool

# Install dependencies
npm install

# Run the app
npm start
```

## Packaging app as a distributable

In order to distribute your finished app, you can use [@nodegui/packer](https://github.com/nodegui/packer)

Just run the pack command:

```console
npm run build
```

This will produce the js bundle along with assets inside the `./dist` directory

```console
npx nodegui-packer --pack ./dist
```

This will build the distributable using @nodegui/packer. The output of the command is found under the build directory.

More details about packer can be found here: https://github.com/nodegui/packer