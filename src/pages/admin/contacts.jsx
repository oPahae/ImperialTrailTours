import { useState, useEffect } from 'react';
import { Users, Trash2, Plus, Search, XCircle, Check, HelpCircle } from 'lucide-react';
import { verifyAuth } from "@/middlewares/adminAuth";

export default function AdminContacts() {
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [searchTermContacts, setSearchTermContacts] = useState('');

    const [faqs, setFaqs] = useState([]);
    const [loadingFaqs, setLoadingFaqs] = useState(true);
    const [searchTermFaqs, setSearchTermFaqs] = useState('');

    const [selectedContact, setSelectedContact] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyForm, setReplyForm] = useState({
        response: '',
        addToFaq: false
    });

    const [activeTab, setActiveTab] = useState('contacts');

    useEffect(() => {
        fetchContacts();
        fetchFaqs();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoadingContacts(true);
            const response = await fetch('/api/contacts/get');
            const data = await response.json();
            setContacts(data.contacts);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        } finally {
            setLoadingContacts(false);
        }
    };

    const fetchFaqs = async () => {
        try {
            setLoadingFaqs(true);
            const response = await fetch('/api/contacts/getFaqs');
            const data = await response.json();
            setFaqs(data.faqs);
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        } finally {
            setLoadingFaqs(false);
        }
    };

    const handleDeleteContact = async (id) => {
        try {
            const response = await fetch(`/api/contacts/delete?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setContacts(contacts.filter(contact => contact.id !== id));
            }
        } catch (error) {
            console.error("Error deleting contact:", error);
        }
    };

    const handleDeleteFaq = async (id) => {
        try {
            const response = await fetch(`/api/contacts/deleteFaq?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setFaqs(faqs.filter(faq => faq.id !== id));
            }
        } catch (error) {
            console.error("Error deleting FAQ:", error);
        }
    };

    const handleReply = (contact) => {
        setSelectedContact(contact);
        setReplyForm({
            response: '',
            addToFaq: false
        });
        setShowReplyModal(true);
    };

    const handleReplySubmit = async (id) => {
        try {
            const mailResponse = await fetch('/api/_mail/reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: selectedContact.email,
                    subject: `RE: ${selectedContact.sujet || 'Your message'}`,
                    text: replyForm.response,
                    id
                }),
            });

            if (replyForm.addToFaq) {
                const faqResponse = await fetch('/api/contacts/addFaq', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nom: selectedContact.nom,
                        question: selectedContact.sujet || selectedContact.msg.substring(0, 50) + '...',
                        reponse: replyForm.response
                    }),
                });
                if (!faqResponse.ok) {
                    console.error("Error adding to FAQ");
                }
            }

            if (mailResponse.ok) {
                setShowReplyModal(false);
                fetchContacts();
            }
        } catch (error) {
            console.error("Error sending reply:", error);
        }
    };

    const filteredContacts = contacts.filter(contact =>
        contact.nom.toLowerCase().includes(searchTermContacts.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTermContacts.toLowerCase()) ||
        contact.sujet.toLowerCase().includes(searchTermContacts.toLowerCase())
    );

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTermFaqs.toLowerCase()) ||
        (faq.answer && faq.answer.toLowerCase().includes(searchTermFaqs.toLowerCase()))
    );

    if (loadingContacts && activeTab === 'contacts') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
                <p className="text-lg text-gray-600">Loading contacts...</p>
            </div>
        );
    }

    if (loadingFaqs && activeTab === 'faqs') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
                <p className="text-lg text-gray-600">Loading FAQs...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 comp">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-amber-700 to-amber-900 text-white">
                <div className="absolute inset-0 opacity-25">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30L0 0h60L30 30z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
                    <div className="flex items-center gap-3 mb-4 mt-10">
                        {activeTab === 'contacts' ? (
                            <>
                                <Users className="w-8 h-8" />
                                <h1 className="text-4xl sm:text-5xl font-bold">Contact Messages</h1>
                            </>
                        ) : (
                            <>
                                <HelpCircle className="w-8 h-8" />
                                <h1 className="text-4xl sm:text-5xl font-bold">FAQ Management</h1>
                            </>
                        )}
                    </div>
                    <p className="text-lg sm:text-xl text-amber-50 max-w-3xl leading-relaxed">
                        {activeTab === 'contacts' ? 'View and manage customer messages' : 'Manage frequently asked questions'}
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-white rounded-lg shadow-sm p-1 flex">
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`flex-1 py-3 px-4 text-center font-medium rounded-md transition-colors ${
                            activeTab === 'contacts' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Users className="w-5 h-5 inline-block mr-2 mb-1" />
                        Contacts
                    </button>
                    <button
                        onClick={() => setActiveTab('faqs')}
                        className={`flex-1 py-3 px-4 text-center font-medium rounded-md transition-colors ${
                            activeTab === 'faqs' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <HelpCircle className="w-5 h-5 inline-block mr-2 mb-1" />
                        FAQs
                    </button>
                </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'contacts' ? (
                <>
                    {/* Search Bar for Contacts */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email or message..."
                                value={searchTermContacts}
                                onChange={(e) => setSearchTermContacts(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Contacts Table */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-amber-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Message</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredContacts.map((contact) => (
                                            <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{contact.nom}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{contact.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{new Date(contact.dateC).toLocaleDateString('FR-fr')}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <details className="cursor-pointer">
                                                        <summary className="text-sm text-amber-600 hover:text-amber-800 font-medium">
                                                            View message
                                                        </summary>
                                                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                                                            {contact.msg}
                                                        </p>
                                                    </details>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleReply(contact)}
                                                        className="text-green-600 hover:text-green-900 mr-3 inline-flex items-center"
                                                        title="Reply"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteContact(contact.id)}
                                                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-gray-200">
                                {filteredContacts.map((contact) => (
                                    <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold text-gray-900">{contact.nom}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{contact.email}</p>
                                            </div>
                                            <div className="flex gap-2 ml-2">
                                                <button
                                                    onClick={() => handleReply(contact)}
                                                    className="text-green-600 hover:text-green-900 p-1"
                                                    title="Reply"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContact(contact.id)}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-xs font-medium text-gray-500">Date:</span>
                                            <p className="text-sm text-gray-900 mt-1">{new Date(contact.dateC).toLocaleDateString('FR-fr')}</p>
                                        </div>
                                        <details className="cursor-pointer">
                                            <summary className="text-sm text-amber-600 hover:text-amber-800 font-medium">
                                                View message
                                            </summary>
                                            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                                                {contact.msg}
                                            </p>
                                        </details>
                                    </div>
                                ))}
                            </div>

                            {filteredContacts.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No contacts found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Search Bar for FAQs */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search FAQs..."
                                value={searchTermFaqs}
                                onChange={(e) => setSearchTermFaqs(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* FAQs Table */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-amber-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Question</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Answer</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredFaqs.map((faq) => (
                                            <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{faq.question}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <details className="cursor-pointer">
                                                        <summary className="text-sm text-amber-600 hover:text-amber-800 font-medium">
                                                            View answer
                                                        </summary>
                                                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                                                            {faq.answer}
                                                        </p>
                                                    </details>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDeleteFaq(faq.id)}
                                                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-gray-200">
                                {filteredFaqs.map((faq) => (
                                    <div key={faq.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold text-gray-900">{faq.question}</h3>
                                            </div>
                                            <div className="flex gap-2 ml-2">
                                                <button
                                                    onClick={() => handleDeleteFaq(faq.id)}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <details className="cursor-pointer">
                                            <summary className="text-sm text-amber-600 hover:text-amber-800 font-medium">
                                                View answer
                                            </summary>
                                            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                                                {faq.answer}
                                            </p>
                                        </details>
                                    </div>
                                ))}
                            </div>

                            {filteredFaqs.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No FAQs found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Reply Modal */}
            {showReplyModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Reply to Message</h2>
                                <button
                                    onClick={() => setShowReplyModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">From: {selectedContact?.nom}</h3>
                                    <p className="text-sm text-gray-600">{selectedContact?.email}</p>
                                    <p className="text-sm text-gray-600 mt-1">{new Date(selectedContact?.dateC).toLocaleDateString('FR-fr')}</p>
                                </div>
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Original Message:</h4>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedContact?.msg}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Response *
                                    </label>
                                    <textarea
                                        value={replyForm.response}
                                        onChange={(e) => setReplyForm({ ...replyForm, response: e.target.value })}
                                        rows="6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Type your response here..."
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="addToFaq"
                                        type="checkbox"
                                        checked={replyForm.addToFaq}
                                        onChange={(e) => setReplyForm({ ...replyForm, addToFaq: e.target.checked })}
                                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="addToFaq" className="ml-2 block text-sm text-gray-700">
                                        Add this response to FAQ
                                    </label>
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        onClick={() => setShowReplyModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleReplySubmit(selectedContact.id)}
                                        disabled={!replyForm.response.trim()}
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export async function getServerSideProps({ req, res }) {
  const admin = verifyAuth(req, res);

  if (!admin) {
    return {
      redirect: {
        destination: "login",
        permanent: false,
      },
    };
  }

  return {
    props: { session: { connected: true } },
  };
}