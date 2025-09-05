# Cricket Quiz Scoreboard

This is a Next.js application, created with the help of Firebase Studio, that functions as a live cricket scoring system. It's designed to have two main interfaces that sync in real-time, allowing for a seamless scoring experience during a quiz or event.

## Key Features

*   **Primary (Scoring) Interface**: Used by the scorer to input runs, wickets, and manage the game. It features customizable scoring buttons, editable team names, and tools to manage "overs".
*   **Monitor Interface**: A display-only screen that shows the live scores to the audience or players. It automatically updates as scores are entered on the primary device.
*   **Real-time Sync**: The two interfaces are synchronized using the browser's `localStorage` and `BroadcastChannel` APIs. This allows for a live experience on a single machine without requiring a complex backend or database.
*   **Customizable Theme & Logo**: The look and feel of the monitor, including colors and the visibility of a logo, can be fully customized from the primary device's settings page.
*   **Export Scores**: You can export the complete scoreboard data to a `.csv` file for your records.

## Getting Started

To run this application on your local machine, please follow these steps.

### Prerequisites

You need to have [Node.js](https://nodejs.org/en/) (which includes `npm`) installed on your computer.

### Installation & Running the App

1.  **Clone the repository** (or download and unzip the code) to your local machine.

2.  **Navigate into the project directory** using your terminal:
    ```bash
    cd path/to/your-project-folder
    ```

3.  **Install the necessary dependencies**:
    ```bash
    npm install
    ```

4.  **Start the development server**:
    ```bash
    npm run dev
    ```

5.  **Open the application** in your browser. The terminal will provide you with a local URL, typically `http://localhost:9002`.

### How to Use

1.  Open two tabs or windows in the same browser.
2.  In the first tab, navigate to the main page and select **"Start Scoring"** to open the Primary interface.
3.  In the second tab, navigate to the main page and select **"Open Monitor"**.
4.  Enter the verification code from the Primary interface into the Monitor interface to connect them.
5.  You can now start scoring! Changes made on the Primary screen will appear instantly on the Monitor screen.