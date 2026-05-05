import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Alpha Tech — Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `[Alpha Tech] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C5A880; border-bottom: 1px solid #eee; padding-bottom: 12px;">
            Nouveau message — Alpha Tech
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr>
              <td style="padding: 8px 0; color: #888; width: 120px;">Nom</td>
              <td style="padding: 8px 0; font-weight: bold;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Email</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Sujet</td>
              <td style="padding: 8px 0;">${subject}</td>
            </tr>
          </table>
          <div style="background: #f9f9f9; border-left: 4px solid #C5A880; padding: 16px; border-radius: 4px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #aaa; font-size: 12px; margin-top: 32px;">
            Message reçu via le formulaire de contact alphatech-startup.com
          </p>
        </div>
      `,
    });

    // Sauvegarder le lead dans Firestore
    try {
      await addDoc(collection(db, 'leads'), {
        name, email, subject, message,
        status: 'nouveau',
        notes: '',
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'notifications'), {
        title: '💬 Nouveau message de contact',
        message: `${name} (${email}) : ${subject}`,
        type: 'info',
        read: false,
        link: '/staff/leads',
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Firestore lead save failed:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Contact send error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi. Réessayez.' }, { status: 500 });
  }
}
