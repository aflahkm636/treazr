// App.js
import React from "react";
import RoutesWrapper from "./Routeswrapper";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "./common/context/Darkthemeprovider";

function App() {
    console.log("App render");

    return (
        <>
            <ToastContainer position="top-center" autoClose={3000} />

            <ThemeProvider>
                <RoutesWrapper />
            </ThemeProvider>
        </>
    );
}

export default App;
