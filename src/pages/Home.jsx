import React from 'react'
import '../App.css'
import { RiImageAiFill } from "react-icons/ri";
import { LuImageUp } from "react-icons/lu";
import { MdOutlineMarkUnreadChatAlt } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { FaArrowUpLong } from "react-icons/fa6";
import { useContext } from 'react';
import { dataContext, prevUser, user } from '../context/UserContext';
import Chat from './Chat';
import { generateResponse } from '../gemini';
import { query } from '../pexels';

function Home() {
    let { startRes, setStartRes, popup, setPopup, input,
        setInput, feature, setFeature, showResult, setShowResult, prevFeature, setPrevFeature, genImgUrl, setGenImgUrl } = useContext(dataContext);
    async function handleSubmit(e) {

        setStartRes(true);
        setPrevFeature(feature);
        setFeature('chat');
        setShowResult("");
        prevUser.data = user.data;
        prevUser.mime_type = user.mime_type;
        prevUser.prompt = input;
        prevUser.imgUrl = user.imgUrl;
        user.data = null;
        user.mime_type = null
        user.imgUrl = null
        setInput('');
        let result = await generateResponse();
        setShowResult(result);
        setFeature('chat');


    }
    function handleImage(e) {
        setFeature('upImg');
        let file = e.target.files[0];

        let reader = new FileReader();
        reader.onload = (e) => {
            let base64 = e.target.result.split(',')[1];
            user.data = base64;
            user.mime_type = file.type
            user.imgUrl = URL.createObjectURL(file)



        }
        reader.readAsDataURL(file);

    }
    // In your Home.jsx, update handleGenerateImage:

    async function handleGenerateImage() {
        setStartRes(true);
        setPrevFeature(feature);
        setGenImgUrl("");
        prevUser.prompt = input;

        try {
            setShowResult("🎨 Generating image...");

            const imageBlob = await query();
            const url = URL.createObjectURL(imageBlob);
            setGenImgUrl(url);
            setShowResult("✅ Image ready!");

        } catch (error) {
            console.error("Image generation failed:", error);
            setShowResult("❌ Failed. Try again.");
        }

        setInput("");
        setFeature("chat");
    }
    return (
        <div className='home'>
            <nav>
                <div className="logo" onClick={() => {
                    setFeature("chat")
                    setStartRes(false)
                    user.data = null;
                    user.mime_type = null
                    user.imgUrl = null

                }}>Smart AI Bot</div>
            </nav>
            <input type="file" accept="image/*" hidden id="inputImg" onChange={handleImage} />
            {!startRes ?
                <div className="hero">
                    <span id="tag">What can I  help with...</span>
                    <div className="cate">
                        <div className="upImg" onClick={() => {
                            document.getElementById("inputImg").click();
                        }}>
                            <LuImageUp />
                            <span>Upload Image</span>
                        </div>
                        <div className="genImg" onClick={() => {
                            setFeature("genImg")
                        }}>
                            <RiImageAiFill />
                            <span>Generate Image</span>
                        </div>
                        <div className="chat" onClick={() => {
                            setFeature("chat")
                        }}>
                            <MdOutlineMarkUnreadChatAlt />
                            <span>Let's Chat</span>
                        </div>
                    </div>
                </div> : <Chat />}



            <form className='input-box' onSubmit={(e) => {
                e.preventDefault();
                if (input) {
                    if (feature === "genImg") {
                        handleGenerateImage();
                    }

                    else {
                        handleSubmit(e)
                    }
                }

            }}>
                <img src={user.imgUrl} alt="" id="inputImage" />
                {popup ? <div className="popup">
                    <div className="select-up" onClick={() => {
                        setPopup(false)
                        setFeature("chat")
                        document.getElementById("inputImg").click();
                    }}>
                        <LuImageUp />
                        <span>Upload Image</span>
                    </div>
                    <div className="select-gen" onClick={() => {
                        setPopup(false)
                        setFeature("chat")
                        setFeature("genImg")
                    }}>
                        <RiImageAiFill />
                        <span>Generate Image</span>
                    </div>

                </div> : null}
                <div id="add" onClick={() => {
                    setPopup(!popup)
                }}>
                    {feature === "genImg" ? <RiImageAiFill id="genImg" /> : <FiPlus />}

                </div>
                <input type="text" placeholder='Ask Something... ' onChange={(e) => {
                    setInput(e.target.value)

                }} value={input} />

                {input ? <button id="submit"><FaArrowUpLong /></button> : null}
            </form>
        </div>
    )
}

export default Home
