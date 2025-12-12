'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkUnwrapImages from 'remark-unwrap-images'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
}

const components: Components = {
  // Заголовки
  h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 border-b pb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>,
  h3: ({ children }) => <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>,
  h4: ({ children }) => <h4 className="text-lg font-semibold mt-3 mb-2">{children}</h4>,
  
  // Параграфы
  p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
  
  // Списки
  ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  
  // Таблицы
  table: ({ children }) => (
    <div className="overflow-x-auto mb-6 border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-sm text-gray-500 border-b">
      {children}
    </td>
  ),
  
  // Код
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || '')
    return match ? (
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
        <code className={className}>
          {children}
        </code>
      </div>
    ) : (
      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    )
  },
  
  // Блоки кода
  pre: ({ children }) => <div className="mb-4">{children}</div>,
  
  // Ссылки
  a: ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </a>
  ),
  
  // Изображения - ВАЖНО: используем figure или просто img без обертки в span
  img: ({ src, alt }) => (
    <>
      <img 
        src={src} 
        alt={alt || 'Изображение'} 
        className="rounded-lg shadow-md max-w-full h-auto mx-auto my-6"
      />
      {alt && alt.trim() && (
        <div className="text-center text-sm text-gray-500 mt-2 mb-6">
          {alt}
        </div>
      )}
    </>
  ),
  
  // Блок цитаты
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600 my-4 py-2 bg-blue-50 rounded-r">
      {children}
    </blockquote>
  ),
  
  // Горизонтальная линия
  hr: () => <hr className="my-8 border-gray-300" />,
  
  // Строчные элементы
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkUnwrapImages]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}