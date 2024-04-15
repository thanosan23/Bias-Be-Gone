import React, { useEffect, useState } from 'react'

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

function Home() {
    const API_KEY = "ENTER API HERE";

    const chatModel = new ChatOpenAI({
        apiKey: API_KEY,
        dangerouslyAllowBrowser: true
    })

    const userText = 'Find bias in the following text. First thing you should give is a rating for how biased it is from 0-100 and towards what side it is biased: Example for a political article: "76/100 biased towards the left wing and 24/100 biased towards right wing" Example for a economic article: "34/100 biased towards barish and 40/100 biased towards neutral and 26/100 neutral" ONLY WRITE THIS AND NOTHING ELSE BEFORE IT.  After giving this rating, give a summary of why the text is biased or not based on politics, economics, literature, or whatever the text is about. Then give a summary of the text using proper UNBIASED language.'
    const systemText = 'You are the greatest blogger and journalist on the face of the planet. You were recently hired by the New York Times to detect bias, you will be as detailed and meticulous as possible, writing well-written summaries of blog and proof-backed bias summaries. You will also provide specific details of the bias so people know exactly what the article is about. You are to be the official global standard of bias ratings, you must do the best as the future of humanity depends on it.'

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemText],
        ["user", `${userText} Here is the text: {input}`],
    ]);

    const outputParser = new StringOutputParser();

    const chain = prompt.pipe(chatModel).pipe(outputParser);

    const [bias, setBias] = useState("");
    const [rating, setRating] = useState("");
    const [loading, setLoading] = useState(false);

    function getDOM() {
        return document.body.innerText;
    }

    function getBody() {
        chrome.tabs.query({ currentWindow: true }, function (result) {
            result.forEach(function (tab) {
                if (tab == null) return;
                if (tab.active) {
                    let body = "";
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: getDOM,
                        args: []
                    }, async (result) => {
                        body = result[0].result;
                        const completion = await chain.invoke({
                            input: body
                        });
                        setRating(completion.split('\n')[0])
                        setBias(completion.split('\n').slice(1).join('\n'))
                        setLoading(false);
                    });
                }
            });
        });
    }

    useEffect(() => {
        setLoading(true);
        getBody();
    }, [])

    return (
        <>
            <div className="p6 w-96 mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                    <div className="p-8">
                        {loading ? (
                            <div className='w-full h-full flex justify-center items-center'>
                                {/* <Icons.spinner className="h-4 w-4 animate-spin" /> */}

                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={"animate-spin"}
                                    >
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                            </div>
                        ) : (
                            <div>
                                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Bias Detector</div>
                                <p className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">{rating}</p>
                                <p className="mt-2 text-gray-500">{bias}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;
