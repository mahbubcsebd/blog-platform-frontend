'use client';

import { useEffect, useState } from 'react';
import BlockRenderer from './BlockRenderer'; // BlockRenderer কম্পোনেন্টটি ইম্পোর্ট করুন

const BlockNoteDisplay = ({ content }) => {
  const [parsedContent, setParsedContent] = useState([]);

  useEffect(() => {
    // কন্টেন্ট না থাকলে একটি খালি অ্যারে সেট করুন
    if (!content) {
      setParsedContent([]);
      return;
    }

    try {
      let parsed = content;

      // কন্টেন্ট যদি স্ট্রিং হয়, তবে এটিকে পার্স করার চেষ্টা করুন
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      // যদি পার্স করার পরেও এটি একটি স্ট্রিং থাকে, তার মানে এটি ডাবল-স্ট্রিং করা ছিল
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }

      setParsedContent(parsed);
    } catch (error) {
      console.error('Invalid BlockNote content: Failed to parse.', error);
      // এরর হলে, null সেট করুন যাতে এরর মেসেজটি দেখানো যায়
      setParsedContent(null);
    }
  }, [content]);

  // পার্স করা কন্টেন্ট একটি অ্যারে কি না, তা আরও নির্ভরযোগ্যভাবে পরীক্ষা করুন
  if (!Array.isArray(parsedContent)) {
    return (
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
        <p>
          Unable to display BlockNote content. Content format may be invalid.
        </p>
      </div>
    );
  }

  return (
    <div className="blocknote-content space-y-2">
      {parsedContent.map((block) => (
        // key হিসেবে block.id ব্যবহার করা ভালো অভ্যাস
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
};

export default BlockNoteDisplay;
