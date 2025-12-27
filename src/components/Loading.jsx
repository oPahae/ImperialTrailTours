import React from 'react'

const Loading = () => {
    return (
        <div
            class="flex flex-col bg-neutral-100 h-[30rem] animate-pulse rounded-xl p-4 gap-4"
        >
            <div class="bg-neutral-200/50 w-full h-1/2 animate-pulse rounded-md"></div>
            <div class="flex flex-col gap-2">
                <div class="bg-neutral-400/50 w-full h-4 animate-pulse rounded-md"></div>
                <div class="bg-neutral-400/50 w-4/5 h-4 animate-pulse rounded-md"></div>
                <div class="bg-neutral-400/50 w-full h-4 animate-pulse rounded-md"></div>
                <div class="bg-neutral-400/50 w-2/4 h-4 animate-pulse rounded-md"></div>
            </div>
        </div>
    )
}

export default Loading