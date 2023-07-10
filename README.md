# Transcribe & Translate Tool (TT-Tool)

## Introduction

The `Transcribe & Translate Tool` is a simple [NodeGUI](https://docs.nodegui.org/) UI for transcribing of audio/video files into text or subtitle and machine translation. The transcribing using [OpenAI Whisper](https://openai.com/research/whisper) and the translation using the [DeepL Engine] https://www.deepl.com/whydeepl.

## Requirements

The following two things before you can use the `tt-tool`:

- Whisper Command-Line Interface (CLI) in order to do the transcribing. You have the following three options to choose from:
  - The official [OpenAI Whisper in Python](https://github.com/openai/whisper).
  - The C++ port of the OpenAI's Whisper called [Whisper.cpp](https://github.com/ggerganov/whisper.cpp).
  - [Windows port of Whisper.cpp] https://github.com/Const-me/Whisper with GPU acceleration support.

  As of now the last two works faster than the original Python implementation. It will certainly change with time.
Download the Whisper CLI from one of the options above and save it in a dedicated folder, preferably into the folder where the `tt-tool` is located. You can configure the exact location into the `tt-tool` itself.

- DeepL API or Authentication Key - it can be obtained as described in the [official DeepL Documentation](https://support.deepl.com/hc/en-us/articles/360020695820-Authentication-Key).

## Running from the source and setting-up development environment

Make sure you have met the requirements listed here: https://docs.nodegui.org/docs/guides/getting-started#developer-environment

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

From the command line:

```bash
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

### Step 1: (_**Run this command only once**_)

```sh
npx nodegui-packer --init tt-tool
```

This will produce the deploy directory containing the template. You can modify this to suite your needs. Like add icons, change the name, description and add other native features or dependencies. Make sure you commit this directory.

### Step 2: (_**Run this command every time you want to build a new distributable**_)

Next you can run the pack command:

```sh
npm run build
```

This will produce the js bundle along with assets inside the `./dist` directory

```sh
npx nodegui-packer --pack ./dist
```

This will build the distributable using @nodegui/packer based on your template. The output of the command is found under the build directory. You should gitignore the build directory.

More details about packer can be found here: https://github.com/nodegui/packer