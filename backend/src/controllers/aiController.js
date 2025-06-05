const Ai_history = require("../models/Ai_history");
const OpenAI = require("openai");
const { findReptileById } = require("./userReptileController");
require('dotenv').config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
//Ham ban dau
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
    return res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateConversation = async (req, res) => {
  try {
    const { historyId } = req.params;
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

const getAllHistoryChat = async (req, res) => {
  try {
    const { reptileId } = req.params;
    if (!reptileId) {
      return res.status(400).json({ message: 'Missing reptileId' });
    }

    const history = await Ai_history.find({
      user_reptile_id: reptileId
    }).sort({ created_at: -1 });
    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching AI history:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
function parseReptileAdvice(data) {
  const sections = data.split(/\*\*(.*?)\*\*/g); // chia theo tiêu đề
  const result = {};

  for (let i = 1; i < sections.length; i += 2) {
    const title = sections[i].trim();
    const content = sections[i + 1].trim();
    result[title] = content;
  }

  return result;
}
async function getReptileExpertResponse(userInput) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
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

async function getBehaviourRecommendation(req, res) {
  const { reptileId } = req.params;

  try {
    const reptile = await findReptileById(reptileId);
    const userInput = `
    Tôi cần bạn đóng vai một chuyên gia về hành vi và chăm sóc bò sát. Hãy phân tích và đưa ra gợi ý về thời gian ngủ nghỉ và ăn uống hợp lý cho con bò sát dưới đây, dựa trên các yếu tố sau:

    - Giống loài: ${reptile.reptile_species}
    - Tuổi: ${reptile.age} tháng
    - Trạng thái ngủ hiện tại (7 ngày): ${JSON.stringify(reptile.sleeping_status.map(item => ({
      date: item.date,
      status: item.status,
    })))}
    - Lịch sử giấc ngủ trong 7 ngày gần nhất (tính theo số giờ mỗi ngày): ${JSON.stringify(reptile.sleeping_history.map(item => item.hours))}

    Yêu cầu:
    1. Gợi ý thời gian ngủ - nghỉ phù hợp theo loài và độ tuổi.
    2. Gợi ý lịch ăn uống tối ưu (số bữa, thời điểm trong ngày).
    3. Nếu có dấu hiệu bất thường trong hành vi ngủ, hãy đưa ra giả thuyết và đề xuất biện pháp điều chỉnh hành vi của bò sát.
    4. Trình bày rõ ràng, dễ hiểu, dành cho người nuôi phổ thông.

    Trả lời theo cấu trúc:
    - Gợi ý lịch ngủ - nghỉ
    - Gợi ý lịch ăn uống
    - Nhận xét và đề xuất điều chỉnh hành vi
    Trả lời ngắn gọn, súc tích, không quá 400 từ.
    `;
    // console.log('User input:', userInput);
    if (!reptile) {
      return res.status(404).json({ message: 'Reptile not found' });
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Bạn là một chuyên gia về hành vi và chăm sóc bò sát. Nhiệm vụ của bạn là phân tích dữ liệu về loài bò sát, độ tuổi, trạng thái giấc ngủ và lịch sử ngủ nghỉ để đưa ra các gợi ý phù hợp về:
          - Lịch trình ngủ - nghỉ tối ưu
          - Thời gian ăn uống hợp lý
          - Đề xuất điều chỉnh hành vi nếu có dấu hiệu bất thường (ví dụ: rối loạn giấc ngủ, ăn lệch giờ)
          Bạn cần căn cứ vào đặc điểm sinh học của từng loài bò sát, giai đoạn phát triển.
          Phản hồi cần rõ ràng, dễ hiểu với người nuôi phổ thông, có thể áp dụng thực tế.
          Nếu người dùng hỏi về các loài động vật khác, hãy lịch sự thông báo rằng bạn chỉ cung cấp thông tin về bò sát.`,
        },
        {
          role: 'user',
          content: userInput,
        },
      ],
      max_tokens: 500
    })

    const content = completion.choices[0].message.content
    const parsed = parseReptileAdvice(content);
    // console.log(parsed)
    // return parsed; 
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Error fetching behaviour recommendation:', error.message);
    throw new Error('Failed to fetch behaviour recommendation');
  }
}
async function getHabitatRecommendation(req, res) {
  const { reptileId } = req.params;

  try {
    const reptile = await findReptileById(reptileId);
    const userInput = `
    Tôi cần bạn đóng vai một chuyên gia về hành vi và chăm sóc bò sát. Hãy phân tích và đưa ra gợi ý về môi trường sống phù hợp cho con bò sát dưới đây, dựa trên các yếu tố sau:

    - Giống loài: ${reptile.reptile_species}
    - Tuổi: ${reptile.age} tháng

    Yêu cầu:
    1. Gợi ý nhiệt độ, độ ẩm và ánh sáng phù hợp cho môi trường sống của loài này.
    2. Đề xuất các yếu tố cần lưu ý trong việc sắp xếp không gian sống (ví dụ: diện tích, nơi trú ẩn, đồ chơi, khu vực tắm nắng).
    3. Nếu có dấu hiệu bất thường trong hành vi môi trường (ví dụ: thiếu ánh sáng, nhiệt độ không ổn định), hãy đưa ra giả thuyết và đề xuất biện pháp điều chỉnh.
    4. Trình bày rõ ràng, dễ hiểu, ngắn gọn (dưới 200 từ).

    Trả lời theo cấu trúc:
    - Gợi ý về môi trường sống (nhiệt độ, độ ẩm, ánh sáng, không gian sống)
    - Đề xuất điều chỉnh nếu môi trường không phù hợp
    `;
    // console.log('User input:', userInput);
    if (!reptile) {
      return res.status(404).json({ message: 'Reptile not found' });
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Bạn là một chuyên gia về hành vi và chăm sóc bò sát. Nhiệm vụ của bạn là phân tích môi trường sống của bò sát và đưa ra các gợi ý về:
          - Nhiệt độ, độ ẩm và ánh sáng phù hợp cho môi trường sống của loài bò sát.
          - Các yếu tố cần lưu ý khi sắp xếp không gian sống (diện tích, nơi trú ẩn, đồ chơi, khu vực tắm nắng).
          - Biện pháp điều chỉnh nếu môi trường không phù hợp, ví dụ: thiếu ánh sáng hoặc nhiệt độ không ổn định.
          Phản hồi cần rõ ràng, dễ hiểu và có thể áp dụng thực tế.`,
        },
        {
          role: 'user',
          content: userInput,
        },
      ],
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content
    const parsed = parseReptileAdvice(content);
    // console.log(parsed)
    return res.status(200).json({
      message: 'Habitat recommendation fetched successfully',
      data: parsed
    })
    // return parsed;
  } catch (error) {
    console.error('Error fetching behaviour recommendation:', error.message);
    throw new Error('Failed to fetch behaviour recommendation');
  }
}
async function getNutritionRecommendation(req, res) {
  const { reptileId } = req.params;
  try {

    const reptile = await findReptileById(reptileId);

    if (!reptile) {
      return res.status(404).json({ message: 'Reptile not found' });
    }

    const userInput = `
    Tôi cần bạn đóng vai một chuyên gia về dinh dưỡng và chăm sóc bò sát. Hãy phân tích và đưa ra gợi ý về chế độ dinh dưỡng hợp lý cho con bò sát dưới đây, dựa trên các yếu tố sau:

    - Giống loài: ${reptile.reptile_species}
    - Tuổi: ${reptile.age} tháng
    - Cân nặng hiện tại: ${reptile.current_weight} g
    - Lịch sử cân nặng (7 ngày gần nhất): ${JSON.stringify(reptile.weight_history.map(item => ({
      date: item.date,
      weight: item.weight
    })))}
    - Lịch sử dinh dưỡng (7 ngày gần nhất): ${JSON.stringify(reptile.nutrition_history.map(item => ({
      created_at: item.created_at,
      updated_at: item.updated_at,
      food_items: item.food_items,
      food_quantity: item.food_quantity,
      is_fasting: item.is_fasting,
      feces_condition: item.feces_condition
    })))}

    Yêu cầu:
    1. Đề xuất loại thức ăn phù hợp cho bò sát theo loài, giai đoạn phát triển và cân nặng.
    2. Tần suất cho ăn, điều chỉnh theo tuổi, sức khỏe, cân nặng và lịch sử dinh dưỡng.
    3. Gợi ý khẩu phần ăn (theo gram hoặc số lượng) cho mỗi bữa ăn.
    4. Đề xuất loại bổ sung vi chất cần thiết (canxi, vitamin, khoáng chất) cho bò sát.
    5. Nếu có dấu hiệu bất thường trong hành vi ăn uống hoặc cân nặng (ví dụ: giảm cân, thừa cân), hãy đưa ra giả thuyết và biện pháp điều chỉnh chế độ ăn.

    Trả lời theo cấu trúc:
    - Gợi ý về chế độ ăn uống (loại thức ăn, tần suất, khẩu phần)
    - Đề xuất bổ sung vi chất (canxi, vitamin, khoáng)
    - Nhận xét và đề xuất điều chỉnh chế độ ăn nếu có dấu hiệu bất thường (giảm cân, thừa cân)
    Trả lời ngắn gọn, súc tích, không quá 400 từ.
    `;
    console.log('User input:', userInput);
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Bạn là chuyên gia dinh dưỡng và chăm sóc bò sát. Nhiệm vụ của bạn là phân tích các yếu tố sau để đưa ra gợi ý dinh dưỡng phù hợp:
          - Loại thức ăn và khẩu phần ăn (theo gram hoặc số lượng) cho bò sát theo giống loài, độ tuổi và cân nặng.
          - Tần suất cho ăn và các vi chất cần bổ sung (canxi, vitamin, khoáng chất).
          - Nếu có dấu hiệu bất thường trong hành vi ăn uống (giảm cân, thừa cân, tình trạng nhịn ăn), đưa ra giả thuyết và biện pháp điều chỉnh chế độ ăn.
          
          Phản hồi cần dễ hiểu, thực tế và áp dụng được cho người nuôi bò sát. Nếu có câu hỏi về loài khác, chỉ cung cấp thông tin về bò sát.`,
        },
        {
          role: 'user',
          content: userInput, // Gửi yêu cầu dinh dưỡng
        },
      ],
      max_tokens: 500,
    });

    // Lấy kết quả trả về từ OpenAI
    const content = completion.choices[0].message.content;
    const parsed = parseReptileAdvice(content);
    // console.log(parsed)
    // return parsed;
    return res.status(200).json({
      message: 'Nutrition recommendation fetched successfully',
      data: parsed,
    });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error('Error fetching nutrition recommendation:', error.message);
    return res.status(500).json({ message: 'Failed to fetch nutrition recommendation', error: error.message });
  }
}
async function getTreatmentRecommendation(req, res) {
  const { reptileId } = req.params;

  try {
    const reptile = await findReptileById(reptileId);

    if (!reptile) {
      return res.status(404).json({ message: 'Reptile not found' });
    }
    let treatmentHistoryData = '';
    if (reptile.treatment_history && reptile.treatment_history.length > 0) {
      treatmentHistoryData = `
      - Lịch sử điều trị: ${JSON.stringify(reptile.treatment_history.map(item => ({
        disease: item.disease,
        treatment_date: item.treatment_date,
        next_treatment_date: item.next_treatment_date,
        doctor_feedback: item.doctor_feedback,
        treatment_medicine: item.treatment_medicine,
        note: item.note
      })))}
      `;
    }

    // Cấu trúc nội dung yêu cầu OpenAI, bao gồm thông tin cân nặng, lịch sử ngủ, lịch sử dinh dưỡng, và lịch sử điều trị (nếu có)
    const userInput = `
    Tôi cần bạn đóng vai một chuyên gia về dinh dưỡng và chăm sóc bò sát. Hãy phân tích tình trạng sức khỏe và chế độ dinh dưỡng hợp lý cho con bò sát dưới đây, dựa trên các yếu tố sau:

    - Giống loài: ${reptile.reptile_species}
    - Tuổi: ${reptile.age} tháng
    - Cân nặng hiện tại: ${reptile.current_weight} g
    - Lịch sử cân nặng (7 ngày gần nhất): ${JSON.stringify(reptile.weight_history.map(item => ({
      date: item.date,
      weight: item.weight
    })))}
    - Trạng thái ngủ hiện tại (7 ngày gần nhất): ${JSON.stringify(reptile.sleeping_status.map(item => ({
      date: item.date,
      status: item.status
    })))}
    - Lịch sử giấc ngủ trong 7 ngày gần nhất (tính theo số giờ mỗi ngày): ${JSON.stringify(reptile.sleeping_history.map(item => ({
      date: item.date,
      hours: item.hours
    })))}
    - Lịch sử dinh dưỡng (7 ngày gần nhất): ${JSON.stringify(reptile.nutrition_history.map(item => ({
      created_at: item.created_at,
      updated_at: item.updated_at,
      food_items: item.food_items,
      food_quantity: item.food_quantity,
      is_fasting: item.is_fasting,
      feces_condition: item.feces_condition
    })))}
    ${treatmentHistoryData}  <!-- Chỉ bao gồm phần này nếu có dữ liệu lịch sử điều trị -->

    Yêu cầu:
    1. Đánh giá tình trạng sức khỏe hiện tại của bò sát dựa trên các dấu hiệu bất thường (ví dụ: giảm cân, thừa cân, tình trạng nhịn ăn, phân không bình thường).
    2. Dựa trên **lịch sử điều trị**, đưa ra **chẩn đoán bệnh lý** và xác định xem bò sát có cần **tiếp tục điều trị** hay không, loại thuốc đã sử dụng, và liệu có cần thay đổi điều trị hay không.
    3. Đề xuất chế độ dinh dưỡng phù hợp dựa trên tình trạng sức khỏe hiện tại của bò sát (thức ăn, khẩu phần ăn, bổ sung vi chất).
    4. Đưa ra biện pháp điều chỉnh chế độ ăn uống và điều trị nếu phát hiện dấu hiệu bất thường trong hành vi ăn uống, cân nặng, hoặc sức khỏe (ví dụ: giảm cân, tình trạng nhịn ăn, phân không bình thường).
    
    Trả lời theo cấu trúc:
    - Chẩn đoán bệnh lý và trạng thái sức khỏe
    - Đề xuất điều trị và biện pháp điều chỉnh nếu có dấu hiệu bất thường (giảm cân, thừa cân, tình trạng nhịn ăn, phân không bình thường)

    Trả lời ngắn gọn, súc tích, không quá 400 từ.
    `;

    // Gọi API OpenAI để nhận gợi ý từ mô hình
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Bạn là chuyên gia về dinh dưỡng và chăm sóc bò sát. Nhiệm vụ của bạn là phân tích tình trạng sức khỏe và chế độ dinh dưỡng của bò sát, đưa ra gợi ý về:
          - Chẩn đoán bệnh lý dựa trên các dấu hiệu bất thường (giảm cân, thừa cân, tình trạng nhịn ăn, phân không bình thường).
          - Đề xuất điều trị dựa trên lịch sử điều trị hiện tại (nếu có) và biện pháp điều chỉnh chế độ ăn.
          Phản hồi cần dễ hiểu, thực tế và có thể áp dụng cho người nuôi bò sát.`,
        },
        {
          role: 'user',
          content: userInput, // Gửi yêu cầu dinh dưỡng và điều trị
        },
      ],
      max_tokens: 500,
    });

    // Lấy kết quả trả về từ OpenAI
    const content = completion.choices[0].message.content;
    const parsed = parseReptileAdvice(content);

    // Trả về kết quả cho người dùng dưới dạng JSON
    return res.status(200).json({
      message: 'Treatment and nutrition recommendation fetched successfully',
      data: parsed,
    });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error('Error fetching treatment recommendation:', error.message);
    return res.status(500).json({ message: 'Failed to fetch treatment recommendation', error: error.message });
  }
}

async function getSummarizeRecommendation(req, res) {
  const { reptileId } = req.params;

  try {
    const reptile = await findReptileById(reptileId);

    if (!reptile) {
      return res.status(404).json({ message: 'Reptile not found' });
    }

    let treatmentHistoryData = '';
    if (reptile.treatment_history && reptile.treatment_history.length > 0) {
      treatmentHistoryData = `
      - Lịch sử điều trị: ${JSON.stringify(reptile.treatment_history.map(item => ({
        disease: item.disease,
        treatment_date: item.treatment_date,
        next_treatment_date: item.next_treatment_date,
        doctor_feedback: item.doctor_feedback,
        treatment_medicine: item.treatment_medicine,
        note: item.note
      })))}
      `;
    }

    // Cấu trúc nội dung yêu cầu OpenAI để đánh giá sức khỏe ngắn gọn
    const userInput = `
    Tôi cần bạn đóng vai một chuyên gia về dinh dưỡng và chăm sóc bò sát. Hãy tổng hợp và đưa ra đánh giá ngắn gọn về tình trạng sức khỏe của bò sát dưới đây, dựa trên các yếu tố sau:

    - Giống loài: ${reptile.reptile_species}
    - Tuổi: ${reptile.age} tháng
    - Cân nặng hiện tại: ${reptile.current_weight} g
    - Lịch sử cân nặng (7 ngày gần nhất): ${JSON.stringify(reptile.weight_history.map(item => ({
      date: item.date,
      weight: item.weight
    })))}
    - Trạng thái ngủ hiện tại (7 ngày gần nhất): ${JSON.stringify(reptile.sleeping_status.map(item => ({
      date: item.date,
      status: item.status
    })))}
    - Lịch sử giấc ngủ trong 7 ngày gần nhất (tính theo số giờ mỗi ngày): ${JSON.stringify(reptile.sleeping_history.map(item => ({
      date: item.date,
      hours: item.hours
    })))}
    - Lịch sử dinh dưỡng (7 ngày gần nhất): ${JSON.stringify(reptile.nutrition_history.map(item => ({
      created_at: item.created_at,
      updated_at: item.updated_at,
      food_items: item.food_items,
      food_quantity: item.food_quantity,
      is_fasting: item.is_fasting,
      feces_condition: item.feces_condition
    })))}
    ${treatmentHistoryData}  <!-- Chỉ bao gồm phần này nếu có dữ liệu lịch sử điều trị -->

    Yêu cầu:
    1. Tổng hợp và đưa ra đánh giá ngắn gọn về tình trạng sức khỏe hiện tại của bò sát (giảm cân, thừa cân, tình trạng nhịn ăn, phân không bình thường).
    2. Trả lời ngắn gọn, súc tích, không quá 50 từ.
    3. Đưa ra 1 từ khóa chính để mô tả tình trạng sức khỏe hiện tại của bò sát.

    Trả lời ngắn gọn, súc tích, không quá 30 từ.
    `;

    // Gọi API OpenAI để nhận gợi ý từ mô hình
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Bạn là chuyên gia về dinh dưỡng và chăm sóc bò sát. Nhiệm vụ của bạn là tổng hợp tình trạng sức khỏe hiện tại của bò sát và đưa ra đánh giá ngắn gọn. Phản hồi cần dễ hiểu, thực tế và súc tích, không quá 50 từ.`,
        },
        {
          role: 'user',
          content: userInput,
        },
      ],
      max_tokens: 30,
    });

    const content = completion.choices[0].message.content;
    console.log('Content:', content);

    // Trả về kết quả cho người dùng dưới dạng JSON
    return res.status(200).json({
      message: 'Health summary fetched successfully',
      data: content,
    });
  } catch (error) {
    console.error('Error fetching health summary:', error.message);
    return res.status(500).json({ message: 'Failed to fetch health summary', error: error.message });
  }
}
module.exports = {
  createAiHistory,
  getAllHistoryChat,
  getReptileExpertResponse,
  updateConversation,
  getHabitatRecommendation,
  getNutritionRecommendation,
  getTreatmentRecommendation,
  getBehaviourRecommendation,
  getSummarizeRecommendation
}
