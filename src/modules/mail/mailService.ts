import { mailtrapClient, sender } from './mail.config';

export const sendPasswordChangeNotification = async (email: string) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Verify your email address',
      html: `
        <h1>Password Change Notification</h1>
        <p>Hello,</p>
        <p>We wanted to let you know that your password has been successfully changed.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p>Thank you,</p>
        <p>The GreenDash Team</p>
      `,
      category: 'Password Change Notification',
    });

    console.log('Password change email sent successfully:', response);
  } catch (error) {
    console.error('Failed to send password change email:', error);
    throw new Error('Failed to send password change email');
  }
};

export const sendEmailChangeNotification = async (email: string, newEmail: string) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Your Email Address Has Been Changed',
      html: `
          <h1>Email Change Notification</h1>
          <p>Hello,</p>
          <p>We wanted to let you know that your email address has been successfully changed to <strong>${newEmail}</strong>.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <p>Thank you,</p>
          <p>The GreenDash Team</p>
        `,
      category: 'Email Change Notification',
    });

    console.log('Email change notification sent successfully:', response);
  } catch (error) {
    console.error('Failed to send email change notification:', error);
    throw new Error('Failed to send email change notification.');
  }
};

export const sendEmailAndPasswordChangeNotification = async (email: string, newEmail: string) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Your Email and Password Have Been Changed',
      html: `
          <h1>Email and Password Change Notification</h1>
          <p>Hello,</p>
          <p>We wanted to let you know that both your email and password have been successfully changed.</p>
          <p>Your new email address is: <strong>${newEmail}</strong>.</p>
          <p>If you did not make these changes, please contact our support team immediately.</p>
          <p>Thank you,</p>
          <p>The GreenDash Team</p>
        `,
      category: 'Email and Password Change Notification',
    });

    console.log('Email and password change notification sent successfully:', response);
  } catch (error) {
    console.error('Failed to send email and password change notification:', error);
    throw new Error('Failed to send email and password change notification.');
  }
};
