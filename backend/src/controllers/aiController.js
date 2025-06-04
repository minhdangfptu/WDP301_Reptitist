const Ai_history = require("../models/Ai_history");
const OpenAI = require("openai");
const { findReptileById } = require("./userReptileController");
require('dotenv').config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})
// const createAiHistory = async (req, res) => {
//     try {
//         const { ai_input, user_reptile_id } = req.body;

//         if (!ai_input || !user_reptile_id) {
//             return res.status(400).json({ message: 'Missing ai_input or user_reptile_id' });
//         }

//         const ai_response = await getReptileExpertResponse(ai_input);

//         // Tạo bản ghi mới
//         const newHistory = new Ai_history({
//             ai_input: Array.isArray(ai_input) ? ai_input : [ai_input],
//             ai_response: Array.isArray(ai_response) ? ai_response : [ai_response],
//             user_reptile_id,
//             created_at: new Date(),
//         });

//         // Lưu vào database
//         const savedHistory = await newHistory.save();

//         return res.status(201).json(savedHistory);
//     } catch (error) {
//         console.error('Error creating AI history:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };
const createAiHistory = async (req, res) => {
  try {
    const { user_reptile_id } = req.body;
    if (!user_reptile_id) {
      return res.status(400).json({ message: 'Missing user_reptile_id' });
    }

    const newConversation = new Ai_history({
      ai_input: [],       // mảng rỗng
      ai_response: [],    // mảng rỗng
      user_reptile_id,
      created_at: new Date(),
    });

    const saved = await newConversation.save();
    return res.status(201).json(saved); // Trả về _id của document mới để client lưu lại
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateConversation = async (req, res) => {
  try {
    const {historyId} = req.params;
    const { ai_input } = req.body;
    if (!historyId || !ai_input) {
      return res.status(400).json({ message: 'Missing historyId or ai_input' });
    }

    const ai_response = await getReptileExpertResponse(ai_input);
    if (!ai_response) {
      return res.status(500).json({ message: 'Failed to get AI response' });
    }

    // Update document, đẩy thêm phần mới vào mảng
    const updated = await Ai_history.findByIdAndUpdate(
      historyId,
      {
        $push: {
          ai_input: ai_input,
          ai_response: ai_response,
        }
      },
      { new: true }
    );

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

async function getReptileExpertResponse(userInput) {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a reptile care expert. Based on the user's 
                    description of how they care for their reptile, provide structured 
                    suggestions to optimize care. Don't provide information about others 
                    categories besides reptiles. If user asks about other animals, 
                    politely inform them that you only provide information about reptiles.`,
                },
                {
                    role: 'user',
                    content: userInput,
                },
            ],
            max_tokens: 500
        })

        const content = completion.choices[0].message.content
        return content
    } catch (error) {
        console.error('Error in getReptileExpertResponse:', error)
        return null
    }
}
// async function getHabitatRecommendation(userInput) {
//     try {
//         const completion = await openai.chat.completions.create({
//             model: 'gpt-4o',
//             messages: [
//                 {
//                     role: 'system',
//                     content: `You are a reptile care expert. Based on the user's 
//                     description of how they care for their reptile, provide structured 
//                     suggestions to optimize care. Don't provide information about others 
//                     categories besides reptiles. If user asks about other animals, 
//                     politely inform them that you only provide information about reptiles.`,
//                 },
//                 {
//                     role: 'user',
//                     content: userInput,
//                 },
//             ],
//             max_tokens: 500
//         })

//         const content = completion.choices[0].message.content
//         return content
//     } catch (error) {
//         console.error('Error in getReptileExpertResponse:', error)
//         return null
//     }
// }
// async function getNutritionRecommendation(userInput) {
//     try {
//         const completion = await openai.chat.completions.create({
//             model: 'gpt-4o',
//             messages: [
//                 {
//                     role: 'system',
//                     content: `You are a reptile care expert. Based on the user's 
//                     description of how they care for their reptile, provide structured 
//                     suggestions to optimize care. Don't provide information about others 
//                     categories besides reptiles. If user asks about other animals, 
//                     politely inform them that you only provide information about reptiles.`,
//                 },
//                 {
//                     role: 'user',
//                     content: userInput,
//                 },
//             ],
//             max_tokens: 500
//         })

//         const content = completion.choices[0].message.content
//         return content
//     } catch (error) {
//         console.error('Error in getReptileExpertResponse:', error)
//         return null
//     }
// }
// async function getTreatmentRecommendation(userInput) {
//     try {
//         const completion = await openai.chat.completions.create({
//             model: 'gpt-4o',
//             messages: [
//                 {
//                     role: 'system',
//                     content: `You are a reptile care expert. Based on the user's 
//                     description of how they care for their reptile, provide structured 
//                     suggestions to optimize care. Don't provide information about others 
//                     categories besides reptiles. If user asks about other animals, 
//                     politely inform them that you only provide information about reptiles.`,
//                 },
//                 {
//                     role: 'user',
//                     content: userInput,
//                 },
//             ],
//             max_tokens: 500
//         })

//         const content = completion.choices[0].message.content
//         return content
//     } catch (error) {
//         console.error('Error in getReptileExpertResponse:', error)
//         return null
//     }
// }

// async function getBehaviourRecommendation(reptileId) {
//     const reptile  = await User_reptiles.findById(reptileId);
//     return reptile;
//     // console.log('Reptile:', reptile);

//     // if (!reptile) {
//     //     return res.status(404).json({ message: 'Reptile not found' });
//     // }
//     // try {
//     //     const completion = await openai.chat.completions.create({
//     //         model: 'gpt-4o',
//     //         messages: [
//     //             {
//     //                 role: 'system',
//     //                 content: `You are a reptile care expert. Based on the user's 
//     //                 description of how they care for their reptile, provide structured 
//     //                 suggestions to optimize care. Don't provide information about others 
//     //                 categories besides reptiles. If user asks about other animals, 
//     //                 politely inform them that you only provide information about reptiles.`,
//     //             },
//     //             {
//     //                 role: 'user',
//     //                 content: userInput,
//     //             },
//     //         ],
//     //         max_tokens: 500
//     //     })

//     //     const content = completion.choices[0].message.content
//     //     return content
//     // } catch (error) {
//     //     console.error('Error in getReptileExpertResponse:', error)
//     //     return null
//     // }
// }
// Giả sử bạn import hàm getReptileById từ module reptileController.js

// async function getBehaviourRecommendation(reptileId) {
//   // Tạo fake req, res để gọi hàm getReptileById (nếu hàm getReptileById dạng controller express)
//   const fakeReq = { params: { reptileId } };
  
//   // Bạn có thể tạo biến để chứa kết quả trả về của hàm getReptileById
//   let reptileData;
  
//   // Tạo fake res object để bắt dữ liệu json trả về
//   const fakeRes = {
//     status(code) {
//       this.statusCode = code;
//       return this;
//     },
//     json(data) {
//       reptileData = data;
//       return data;
//     }
//   };
  
//   await getReptileById(fakeReq, fakeRes);
  
//   // Nếu muốn chỉ lấy object reptile, không lấy message thì bạn có thể xử lý ở đây
//   if (fakeRes.statusCode === 200 && reptileData) {
//     return reptileData;
//   } else {
//     throw new Error(reptileData?.message || 'Failed to get reptile');
//   }
// }

// Giả sử bạn đã import hàm findReptileById

async function getBehaviourRecommendation(req, res) {
  const { reptileId } = req.params;

  try {
    const reptile = await findReptileById(reptileId);

    return res.status(200).json({
      message: 'Behaviour recommendation fetched successfully',
      data: reptile
    });
  } catch (error) {
    console.error('Error fetching behaviour recommendation:', error.message);

    if (error.message === 'Invalid reptile ID') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Reptile not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to fetch behaviour recommendation', error: error.message });
  }
}


module.exports = {
    createAiHistory,
    getReptileExpertResponse,
    updateConversation,
    // getHabitatRecommendation,
    // getNutritionRecommendation,
    // getTreatmentRecommendation,
    getBehaviourRecommendation
}
