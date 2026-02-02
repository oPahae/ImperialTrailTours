import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { User, Lock, Trash2, Save, AlertCircle, CheckCircle, LogOut, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { verifyAuth } from "@/middlewares/auth";

export default function Profile({ session }) {
  const [userInfo, setUserInfo] = useState({
    nom: session?.nom || '',
    prenom: session?.prenom || '',
    email: session?.email || ''
  });
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoMsg('');

    try {
      const res = await fetch('/api/profile/updateInfos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.id,
          nom: userInfo.nom,
          prenom: userInfo.prenom,
          email: userInfo.email
        })
      });

      const data = await res.json();

      if (res.ok) {
        setInfoMsg('Informations updated successfully');
      } else {
        setInfoMsg(data.message || 'Update failed');
      }
    } catch (error) {
      setInfoMsg('Server error');
    } finally {
      setInfoLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (passwords.newPassword.length < 4) {
      setPasswordMsg('Password must be at least 4 characters');
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/profile/updatePassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.id,
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMsg('Password updated successfully');
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMsg(data.message || 'Update failed');
      }
    } catch (error) {
      setPasswordMsg('Server error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteMsg('');

    try {
      const res = await fetch('/api/profile/deleteAcc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session.id })
      });

      const data = await res.json();

      if (res.ok) {
        setDeleteMsg('Account deleted successfully');
        handleLogout();
      } else {
        setDeleteMsg(data.message || 'Deletion failed');
      }
    } catch (error) {
      setDeleteMsg('Server error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    fetch('/api/_auth/logout').then(res => res.json()).then(data => {
      if (data.message === 'success')
        window.location.href = '/';
      else
        alert(data.message);
    }).catch(err => alert(err));
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">You must be logged in</h3>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div ref={containerRef} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">My Profile</h2>
            <p className="text-amber-50 text-lg">Manage your account settings</p>
          </div>

          <div className="px-8 py-8">
            <div className="w-full flex justify-end mb-8">
              <button onClick={handleLogout} className="bg-amber-600 hover:bg-amber-700 duration-200 px-4 py-2 rounded-lg shadow-xl text-white font-bold flex gap-2">
                <LogOut />
                Logout
              </button>
            </div>

            <div className="space-y-8">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <User className="w-6 h-6 text-amber-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                </div>

                <form onSubmit={handleUpdateInfo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={userInfo.nom}
                      onChange={(e) => setUserInfo({ ...userInfo, nom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={userInfo.prenom}
                      onChange={(e) => setUserInfo({ ...userInfo, prenom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={infoLoading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {infoLoading ? 'Updating...' : 'Update Information'}
                  </button>

                  {infoMsg && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${infoMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {infoMsg.includes('success') ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <p className="text-sm">{infoMsg}</p>
                    </div>
                  )}
                </form>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <Lock className="w-6 h-6 text-amber-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">Change Password</h3>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        value={passwords.oldPassword}
                        onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>

                  {passwordMsg && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${passwordMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {passwordMsg.includes('success') ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <p className="text-sm">{passwordMsg}</p>
                    </div>
                  )}
                </form>
              </div>

              <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <Trash2 className="w-6 h-6 text-red-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">Danger Zone</h3>
                </div>

                <p className="text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-red-600 font-semibold text-center">Are you absolutely sure?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50"
                      >
                        {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                    </div>
                  </div>
                )}

                {deleteMsg && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg mt-4 ${deleteMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {deleteMsg.includes('success') ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm">{deleteMsg}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);

  if (user && user.id) return {
    props: { session: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email } },
  };
  else return {
    props: { session: null },
  };
}