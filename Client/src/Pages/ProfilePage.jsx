import ProfileForm from "../components/ProfileForm";
import "../styles/profile.css";

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <section className="profile-page__hero">
        <div>
          <p className="profile-page__eyebrow">Profile Settings</p>
          <h1>Build a profile you can actually review at a glance</h1>
          <p>
            The form is organized into clear sections with persistent labels, helper text, and
            enough spacing to make updates easier on both desktop and mobile.
          </p>
        </div>
        <aside className="profile-page__tip">
          <strong>Why this matters</strong>
          <p>
            Better labels reduce mistakes when editing old values and make your health details more
            understandable later.
          </p>
        </aside>
      </section>
      <ProfileForm />
    </div>
  );
};

export default ProfilePage;