// app/blog/components/FeedHeader.jsx
export default function FeedHeader() {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">ব্লগ ফিড</h1>
        <p className="text-lg text-gray-600">
          সর্বশেষ আর্টিকেল এবং আপডেট দেখুন
        </p>
      </div>

      {/* Stats or trending topics could go here */}
      <div className="flex justify-center space-x-6 text-sm text-gray-500">
        <div className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          লাইভ আপডেট
        </div>
        <div>সর্বশেষ আপডেট: এখনি</div>
      </div>
    </div>
  );
}
