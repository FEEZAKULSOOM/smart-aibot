import { prevUser } from "./context/UserContext"

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=AIzaSyB_zi3g2SpOPumQUPh9HcbovpHgCUDKC30"
export async function generateResponse() {
    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [
                {
                    "parts": [
                        {
                            "text": prevUser.prompt
                        },
                        prevUser.data ? [{

                            "inline_data": {
                                "mime_type": prevUser.mime_type,
                                "data": prevUser.data
                            }
                        }
                        ] : []
                    ]

                }
            ]
        })
    }
    try {
        let response = await fetch(Api_Url, RequestOption)
        let data = await response.json()
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim()
        console.log(data)
        return apiResponse
    }
    catch (err) {
        console.log(err)
    }
}