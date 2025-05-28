## Quickstart guide

- **To start the project run `run_app.bat`**

- **If you need to install the *venv environment* run inside the *backend* folder `python -m venv venv`, `.\venv\Scripts\activate` and `pip install -r requirements.txt`**

## How to setup the project

### Environment setup
- **Install Python:** You can install it from Python.
- **Install Node.js:** You can install it from Node.
- **Install Git:** You can install it from Git.

### Getting the API Token
- Create an account on **Hugging Face**.
- Generate a **read-only API key** in your **account settings** (save it securely for the next steps).

### Cloning the Project
- **Open a Git terminal:** Do this by opening Git Bash from your computer’s search bar.
- **Clone the project:** Navigate to the folder where you want to install the project and run `git clone https://github.com/Fffantasia/AI-Chat.git`.
- **Install project dependencies:** Open the newly created project folder in VS Code and run `npm install` in the terminal.

### Setting Up the Python Environment
- **Install the Python environment:** Inside the project's *backend* folder, run `python -m venv venv` in the terminal, you should see a *venv* folder created.
- **Activate the virtual environment:** Still in the *backend* folder, run in the terminal `.venv/Scripts/activate`, you should see `(.venv)` appear before the project path in the terminal.
- **Install the dependencies:** Still in the *backend* folder, run while the venv environment is active `pip install -r requirements.txt` in the console.
- **Create Environment Variables:** Create a *.env* file and add the following line `HF_TOKEN=(Your Hugging Face API token)`. The text after the equal sign should be the API key you previously obtained from your Hugging Face account.

### Starting the Project
- **Open the project in File Explorer:** Right-click on the file navigator in VS Code and click `Reveal in File Explorer` or locate the project folder directly via *File Explorer*.
- **Start the project:** Double-click on the `run_app.bat` file. Two terminals will open, one with the *React server* running, and the other starting to *install the model with Python* and later *maintaining the AI server*.
