import React from "react";

function Loading({name}) {
    return (
        <div className="min-h-[50vh] flex items-center justify-center p-4 mt-10">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your {name}...</p>
            </div>
        </div>
    );
}

export default Loading;
