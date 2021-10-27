const welcomeEmail = async (user: any, password: string) => {
  let html = `
      <p>Hi ${user.username},</p>
      <p>All done! Your Livyana setup is done now.</p>
    `;
  return html;
};

const confirmEmail = (name, id) => {
  let html = `
    Hi ${name},
    <br/>
    <br/>
    You’re almost ready to start using Livyana.
    <br/>
    <br/>
    Simply click the link below to verify your email address.
    <br/>
    <br/>
    <a href="${process.env.DOMAIN}/confirm_email/${id}">Confirm Account</a>
    <br/>
    <br/>
    <br/>
    Thanks,
    <br/>
    Livyana Team
    `;
  return html;
};

export { welcomeEmail, confirmEmail };
