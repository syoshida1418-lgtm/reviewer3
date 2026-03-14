"use client"
import React from "react";
import TextEditor from "../../../../components/text-editor";
import TagManager from "../../../../components/tag-manager";
import AIReviewPanel from "../../../../components/ai-review-panel";

const NewDiaryPage = () => {
  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [memo, setMemo] = React.useState("");

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* 記事タイトル */}
      <div>
        <label className="block mb-2 font-semibold">タイトル</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="タイトルを入力"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      {/* 英語記事本文 */}
      <div>
        <label className="block mb-2 font-semibold">記事本文（英語）</label>
        <TextEditor value={text} onChange={setText} />
      </div>

      {/* タグ設定 */}
      <div>
        <label className="block mb-2 font-semibold">タグ</label>
        <TagManager value={tags} onChange={setTags} />
      </div>

      {/* メモ欄 */}
      <div>
        <label className="block mb-2 font-semibold">メモ</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          placeholder="メモを入力"
          rows={3}
          value={memo}
          onChange={e => setMemo(e.target.value)}
        />
      </div>

      {/* AIレビュー */}
      <div>
        <label className="block mb-2 font-semibold">AI Review</label>
        <AIReviewPanel text={text} />
      </div>
    </div>
  );
};

export default NewDiaryPage;
