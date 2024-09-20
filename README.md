# JDraw (Excalidraw Clone)

A whiteboard application built using **React**, **TypeScript**, and **RTK Query**. The app allows users to create and edit shapes like rectangles, circles, lines, and text on a canvas, similar to **Excalidraw**.

## Features

- Draw basic shapes: rectangles, ellipses, diamonds, arrows, and lines.
- Freehand drawing with the pencil tool.
- Add and edit text directly on the canvas.
- Zoom in and out of the canvas for better navigation.
- Undo and redo actions.
- Responsive design with a flexible toolbar and customizable options.
- Persistent state management with **Redux Toolkit** and **RTK Query**.
- Hotkeys for easier navigation and control.
- Support for panning and scaling the canvas.

## Technologies

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: Type-safe JavaScript for better development experience.
- **Redux Toolkit**: Efficient state management with **RTK Query** for data fetching.
- **Vite**: Fast build tool and development server.
- **SVG**: Used for rendering shapes and text on the canvas.
- **React Hooks**: Manage application state and lifecycle events.

### Main Directories

- **components**: UI components for the whiteboard, such as dropdown menus, history actions, and zoom controls.
- **domain**: Core business logic for drawing shapes like rectangles, ellipses, arrows, and text.
- **hooks**: Custom hooks such as `usePressedKeys` to handle keyboard shortcuts.
- **slices**: State slices managed by **Redux Toolkit** for panning, scaling, and storing elements on the canvas.
- **utils**: Utility functions for handling SVG rendering and cursor position updates.
- **store**: Redux store setup with middleware for **RTK Query**.

## Running Locally

To run the project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/whiteboard-app.git
    ```

2. Navigate to the project directory:

    ```bash
    cd jdraw
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Start the development server:

    ```bash
    npm run dev
    ```

The app will be available locally at [http://localhost:5173](http://localhost:5173).

## Future Enhancements

- Add support for real-time collaboration.
- Implement export/import of whiteboard data as image files (PNG, SVG).
- Add user authentication and session management.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
