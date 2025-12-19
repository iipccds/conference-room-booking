import { NextResponse } from "next/server";
import { sendEmail } from "@/config/sendEmail"; // ⬅ use your Gmail SMTP helper

export async function POST(req) {
  try {
    const data = await req.json();
    const isDeclined = data.booking_status === "Declined";

    const subject = isDeclined
      ? `Booking Declined: ${data.event_name}`
      : `Booking Confirmed: ${data.event_name}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f7f6;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <tr>
            <td align="center" style="background-color: #00447c; padding: 20px 0; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">BookIT</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <h2 style="color: ${
                  isDeclined ? "#d9534f" : "#5cb85c"
                }; font-size: 24px;">
                    ${isDeclined ? "Booking Declined" : "Booking Confirmed"}
                </h2>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">Hello,</p>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                    Your booking request for the event "<strong>${
                      data.event_name
                    }</strong>" has been ${
      isDeclined ? "declined" : "confirmed"
    }.
                </p>

                <table border="0" cellpadding="10" cellspacing="0" width="100%" style="border-collapse: collapse; margin-top: 20px; border: 1px solid #dddddd;">
                    <tr style="background-color: #f9f9f9;">
                        <td style="border-bottom: 1px solid #dddddd; font-weight: bold;">Event:</td>
                        <td style="border-bottom: 1px solid #dddddd;">${
                          data.event_name
                        }</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #dddddd; font-weight: bold;">Room:</td>
                        <td style="border-bottom: 1px solid #dddddd;">${
                          data.room_name
                        }</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="border-bottom: 1px solid #dddddd; font-weight: bold;">Start:</td>
                        <td style="border-bottom: 1px solid #dddddd;">${
                          data.check_in
                        }</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #dddddd; font-weight: bold;">End:</td>
                        <td style="border-bottom: 1px solid #dddddd;">${
                          data.check_out
                        }</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="border-bottom: 1px solid #dddddd; font-weight: bold;">Attendees:</td>
                        <td style="border-bottom: 1px solid #dddddd;">${
                          data.attendees
                        }</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #dddddd; font-weight: bold;">Meeting Type:</td>
                        <td style="border-bottom: 1px solid #dddddd;">${
                          data.meeting_type
                        }</td>
                    </tr>
                    ${
                      isDeclined
                        ? `<tr style="background-color: #f9f9f9;">
                              <td style="font-weight: bold; color: #d9534f;">Reason for Decline:</td>
                              <td>${data.cancellation_reason}</td>
                          </tr>`
                        : ""
                    }
                </table>

                <p style="color: #777777; font-size: 12px; margin-top: 30px; text-align: center;">Booking ID: ${
                  data.$id
                }</p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 20px; background-color: #eeeeee; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                <p style="margin: 0; color: #555555; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
            </td>
        </tr>
    </table>
</body>
</html>`;

    await sendEmail({
      to: data.user_email,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("📨 Gmail SMTP Status Email Error →", error);
    return NextResponse.json(
      { error: "Email failed to send" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import { Resend } from "resend";

// const resend = new Resend(process.env.NEXT_RESEND_API_KEY);

// export async function POST(req) {
//   try {
//     const data = await req.json();
//     const isDeclined = data.booking_status === "Declined";

//     await resend.emails.send({
//       from: process.env.NEXT_RESEND_EMAIL_FROM,
//       to: data.user_email,
//       subject: isDeclined
//         ? `Booking Declined: ${data.event_name}`
//         : `Booking Confirmed: ${data.event_name}`,
//       html: `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>${isDeclined ? "Booking Declined" : "Booking Confirmed"}</title>
// </head>
// <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f7f6;">
//     <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
//         <tr>
//             <td align="center" style="background-color: #00447c; padding: 20px 0; border-top-left-radius: 8px; border-top-right-radius: 8px;">
//                 <h1 style="color: #ffffff; margin: 0; font-size: 28px;">BookIT</h1>
//             </td>
//         </tr>
//         <tr>
//             <td style="padding: 40px 30px;">
//                 <h2 style="color: ${
//                   isDeclined ? "#d9534f" : "#5cb85c"
//                 }; font-size: 24px;">${
//         isDeclined ? "Booking Declined" : "Booking Confirmed"
//       }</h2>
//                 <p style="color: #555555; font-size: 16px; line-height: 1.5;">Hello,</p>
//                 <p style="color: #555555; font-size: 16px; line-height: 1.5;">Your booking request for the event "<strong>${
//                   data.event_name
//                 }</strong>" has been ${
//         isDeclined ? "declined" : "confirmed"
//       }.</p>
//                 <table border="0" cellpadding="10" cellspacing="0" width="100%" style="border-collapse: collapse; margin-top: 20px; border: 1px solid #dddddd;">
//                     <tr style="background-color: #f9f9f9;">
//                         <td style="border-bottom: 1px solid #dddddd; font-weight: bold; color: #333;">Event:</td>
//                         <td style="border-bottom: 1px solid #dddddd;">${
//                           data.event_name
//                         }</td>
//                     </tr>
//                     <tr>
//                         <td style="border-bottom: 1px solid #dddddd; font-weight: bold; color: #333;">Room:</td>
//                         <td style="border-bottom: 1px solid #dddddd;">${
//                           data.room_name
//                         }</td>
//                     </tr>
//                     <tr style="background-color: #f9f9f9;">
//                         <td style="border-bottom: 1px solid #dddddd; font-weight: bold; color: #333;">Start:</td>
//                         <td style="border-bottom: 1px solid #dddddd;">${
//                           data.check_in
//                         }</td>
//                     </tr>
//                     <tr>
//                         <td style="border-bottom: 1px solid #dddddd; font-weight: bold; color: #333;">End:</td>
//                         <td style="border-bottom: 1px solid #dddddd;">${
//                           data.check_out
//                         }</td>
//                     </tr>
//                     <tr style="background-color: #f9f9f9;">
//                         <td style="border-bottom: 1px solid #dddddd; font-weight: bold; color: #333;">Attendees:</td>
//                         <td style="border-bottom: 1px solid #dddddd;">${
//                           data.attendees
//                         }</td>
//                     </tr>
//                     <tr>
//                         <td style="border-bottom: 1px solid #dddddd; font-weight: bold; color: #333;">Meeting Type:</td>
//                         <td style="border-bottom: 1px solid #dddddd;">${
//                           data.meeting_type
//                         }</td>
//                     </tr>
//                     ${
//                       isDeclined
//                         ? `<tr style="background-color: #f9f9f9;"><td style="font-weight: bold; color: #d9534f;">Reason for Decline:</td><td>${data.cancellation_reason}</td></tr>`
//                         : ""
//                     }
//                 </table>
//                 <p style="color: #777777; font-size: 12px; margin-top: 30px; text-align: center;">Booking ID: ${
//                   data.$id
//                 }</p>
//             </td>
//         </tr>
//         <tr>
//             <td align="center" style="padding: 20px; background-color: #eeeeee; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
//                 <p style="margin: 0; color: #555555; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
//             </td>
//         </tr>
//     </table>
// </body>
// </html>`,
//     });

//     return NextResponse.json({ ok: true });
//   } catch (error) {
//     console.log("EMAIL STATUS ERROR:", error);
//     return NextResponse.json({ error: "Email failed" }, { status: 500 });
//   }
// }
