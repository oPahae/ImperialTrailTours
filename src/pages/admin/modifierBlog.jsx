import { useState, useRef, useEffect } from 'react';
import { Calendar, Image, FileText, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { verifyAuth } from "@/middlewares/adminAuth";

export default function AdminBlogModifier() {
    const [isQuillReady, setIsQuillReady] = useState(false);
    const router = useRouter();
    const { id } = router.query;
    const [formData, setFormData] = useState({
        title: '',
        img: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [imagePreview, setImagePreview] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);
    const fileInputRef = useRef(null);
    const editorRef = useRef(null);
    const quillRef = useRef(null);

    useEffect(() => {
        const quillCSS = document.createElement('link');
        quillCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css';
        quillCSS.rel = 'stylesheet';
        document.head.appendChild(quillCSS);

        const quillScript = document.createElement('script');
        quillScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js';
        quillScript.async = true;
        quillScript.onload = () => {
            setTimeout(() => {
                if (editorRef.current && window.Quill && !quillRef.current) {
                    quillRef.current = new window.Quill(editorRef.current, {
                        theme: 'snow',
                        placeholder: 'Write your article content here...',
                        modules: {
                            toolbar: [
                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'align': [] }],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['blockquote', 'code-block'],
                                ['link', 'image'],
                                ['clean']
                            ]
                        }
                    });

                    quillRef.current.on('text-change', () => {
                        const html = quillRef.current.root.innerHTML;
                        setFormData(prev => ({ ...prev, content: html }));
                    });

                    // ✅ signaler que Quill est prêt
                    setIsQuillReady(true);
                }
            }, 300);
        };

        document.body.appendChild(quillScript);

        return () => {
            if (quillCSS.parentNode) quillCSS.parentNode.removeChild(quillCSS);
            if (quillScript.parentNode) quillScript.parentNode.removeChild(quillScript);
        };
    }, []);

    useEffect(() => {
        if (id) {
            fetchBlog();
        }
    }, [id]);

    useEffect(() => {
        if (isQuillReady && formData.content) {
            quillRef.current.clipboard.dangerouslyPasteHTML(formData.content);
        }
    }, [isQuillReady, formData.content]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/blogs/getOne?id=${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch blog');
            }

            setFormData({
                title: data.blog.title,
                img: data.blog.img,
                content: data.blog.content
            });

            setImagePreview(data.blog.img);

            setFormData({ title: data.blog.title, img: data.blog.img, content: data.blog.content });
            setImagePreview(data.blog.img);
        } catch (err) {
            console.error("Error fetching blog:", err);
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) {
                setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData(prev => ({ ...prev, img: base64String }));
                setImagePreview(base64String);
                setMessage({ type: '', text: '' });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const convertToBase64 = (file) => {
            return new Promise((resolve, reject) => {
                if (typeof file === 'string') {
                    // Si c'est déjà une string (base64 ou URL), on la retourne directement
                    resolve(file.startsWith('data:image/') ? file.split(',')[1] : file);
                } else {
                    // Si c'est un fichier, on le convertit en base64
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = (error) => reject(error);
                }
            });
        };

        if (!formData.title || !formData.img || !formData.content) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            // Convertir l'image en base64 si nécessaire
            const base64 = await convertToBase64(formData.img);

            const response = await fetch('/api/blogs/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    title: formData.title,
                    img: base64,
                    content: formData.content,
                    date: new Date().toISOString()
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Blog updated successfully!' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update blog' });
            }
        } catch (error) {
            console.error('Error updating blog:', error);
            setMessage({ type: 'error', text: 'An error occurred while updating the blog' });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
                <p className="text-lg text-gray-600">Loading blog data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
                        Edit Blog Article
                    </h1>
                    <p className="text-lg text-gray-600">
                        Update your story and share it with the world
                    </p>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border-2 border-green-200'
                        : 'bg-red-50 text-red-800 border-2 border-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        )}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Article Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter an engaging title..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Featured Image *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-500 transition-colors">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="imageUpload"
                            />
                            <label htmlFor="imageUpload" className="cursor-pointer">
                                {imagePreview ? (
                                    <div className="space-y-4">
                                        <img
                                            src={imagePreview.startsWith('data:image/') ? imagePreview : `data:image/jpeg;base64,${imagePreview}`}
                                            alt="Preview"
                                            className="max-h-64 mx-auto rounded-lg shadow-md"
                                        />
                                        <p className="text-sm text-amber-600 font-medium">
                                            Click to change image
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Image className="w-12 h-12 mx-auto text-gray-400" />
                                        <div>
                                            <p className="text-gray-600 font-medium">
                                                Click to upload featured image
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                PNG, JPG up to 5MB
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Rich Text Editor with Quill */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Article Content *
                        </label>
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-amber-500 transition-colors">
                            <div ref={editorRef} style={{ minHeight: '400px' }} />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Use the toolbar above to format your content with Quill editor
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="inline-flex items-center px-8 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5 mr-2" />
                                    Update Article
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
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