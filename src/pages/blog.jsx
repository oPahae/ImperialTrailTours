import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Calendar, Tag } from 'lucide-react';
import { verifyAuth } from "@/middlewares/auth";

export default function BlogPage() {
  const router = useRouter();
  const { id } = router.query;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/getOne?id=${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch blog');
      }

      setBlog(data.blog);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading blog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Blog Not Found</h2>
          <p className="text-gray-600">The blog you're looking for doesn't exist.</p>
        </div>
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
            <Tag className="w-8 h-8" />
            <h1 className="text-4xl sm:text-5xl font-bold">{blog.title}</h1>
          </div>
          <p className="text-lg sm:text-xl text-amber-50 max-w-3xl leading-relaxed flex gap-1 items-center">
            <Calendar className="w-5 h-5 mr-2" />
            <span>{new Date(blog.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Image */}
        <div className="mb-12">
          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            <img
              src={blog.img}
              alt={blog.title}
              className="w-full h-96 object-cover"
            />
          </div>
        </div>

<blockquote>ccc</blockquote>

        {/* Blog Content */}
        <article className="prose lg:prose-xl max-w-none mb-12">
          {/* Render HTML content safely */}
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </article>

        {/* Back Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            ← Back to Blogs
          </button>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);

  if (user) return {
    props: { session: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email } },
  };

  else return {
    props: { session: null },
  };
}