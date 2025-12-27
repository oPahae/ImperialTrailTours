import { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Search, Tag, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { verifyAuth } from "@/middlewares/adminAuth";

export default function Blogs() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blogs/get');
      const data = await response.json();
      console.log(data.blogs)
      setBlogs(data.blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (id) => {
    router.push(`modifierBlog?id=${id}`);
  };

  const handleDeleteBlog = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/blogs/delete?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog.id !== id));
      } else {
        console.error("Error deleting blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading blogs...</p>
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
            <Users className="w-8 h-8" />
            <h1 className="text-4xl sm:text-5xl font-bold">Help people to explore Morocco</h1>
          </div>
          <p className="text-lg sm:text-xl text-amber-50 max-w-3xl leading-relaxed">
            Add some travel tips, cultural insights, and inspiring stories from the heart of Morocco
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Add Blog Button */}
        <div className="flex justify-end mb-6">
          <Link
            href="ajouterBlog"
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Blog
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No blogs found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <button
                onClick={e => { e.stopPropagation(); router.push(`modifierBlog?id=${blog.id}`); }}
                key={blog.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-2xl group relative"
              >
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    title="Edit blog"
                  >
                    <Edit2 className="w-5 h-5 text-amber-600" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteBlog(blog.id, e)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    title="Delete blog"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>

                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={blog.img}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(blog.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-amber-700 transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  <div className="flex items-center text-amber-600 font-semibold group-hover:text-amber-700 transition-colors">
                    <span>Read More</span>
                    <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredBlogs.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-amber-700">{filteredBlogs.length}</span> {filteredBlogs.length === 1 ? 'article' : 'articles'}
            </p>
          </div>
        )}
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