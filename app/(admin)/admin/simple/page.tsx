// app/(admin)/admin/simple/page.tsx - ПОЛНОСТЬЮ АДАПТИРОВАННЫЙ
'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Book, Save, Trash2, Eye, Plus, X,
  Calendar, User, FileText, Download, Upload,
  CheckCircle, AlertCircle, ChevronLeft, ChevronRight,
  Image as ImageIcon, Bold, Italic, Link,
  Flame, AlertTriangle, GraduationCap, Shield,
  RefreshCw, FolderOpen
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Topic {
  id: number
  topic_number: number
  title: string
  description: string
  content: string
  body: string
  date: string
  author: string
  keywords?: string[]
  section?: string
  order?: number
}

const sections = [
  { id: 'fires', name: 'Пожары', icon: <Flame className="w-5 h-5" />, color: 'from-red-500 to-orange-500', prefix: 1 },
  { id: 'emergency', name: 'Чрезвычайные ситуации', icon: <AlertTriangle className="w-5 h-5" />, color: 'from-orange-500 to-amber-500', prefix: 101 },
  { id: 'education', name: 'Образование', icon: <GraduationCap className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500', prefix: 201 },
  { id: 'protection', name: 'Защита', icon: <Shield className="w-5 h-5" />, color: 'from-green-500 to-emerald-500', prefix: 301 },
]

export default function SimpleAdminPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [preview, setPreview] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string>('fires')
  const [sectionStats, setSectionStats] = useState<Record<string, number>>({
    fires: 0,
    emergency: 0,
    education: 0,
    protection: 0
  })
  
  const [formData, setFormData] = useState({
    topic_number: '',
    title: '',
    description: '',
    content: '# Новая тема\n\nНачните писать содержание темы здесь...\n',
    date: new Date().toISOString().split('T')[0],
    author: 'Преподаватель',
    keywords: [] as string[],
    order: 1
  })

  const [newKeyword, setNewKeyword] = useState('')

  // Загружаем темы при изменении выбранного раздела
  useEffect(() => {
    loadSectionTopics()
  }, [selectedSection])

  const loadSectionTopics = async () => {
    setLoading(true)
    try {
      // Загружаем темы выбранного раздела
      const response = await fetch(`/api/github/topics?section=${selectedSection}`, {
        cache: 'no-store' // Добавьте это
      })
      if (response.ok) {
        const data = await response.json()
        setTopics(data)
      } else {
        showMessage('error', 'Ошибка загрузки тем')
      }
      
      // Загружаем статистику по всем разделам
      const stats: Record<string, number> = {}
      
      for (const section of sections) {
        try {
          const sectionResponse = await fetch(`/api/github/topics?section=${section.id}`, {
            cache: 'no-store' // Добавьте это
          })
          if (sectionResponse.ok) {
            const sectionData = await sectionResponse.json()
            stats[section.id] = sectionData.length
          } else {
            stats[section.id] = 0
          }
        } catch (error) {
          console.error(`Error loading stats for ${section.id}:`, error)
          stats[section.id] = 0
        }
      }
      
      setSectionStats(stats)
      
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      showMessage('error', 'Ошибка загрузки тем')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleCreateNew = () => {
    const currentSection = sections.find(s => s.id === selectedSection)
    const maxTopicNumber = topics.length > 0 
      ? Math.max(...topics.map(t => t.topic_number))
      : (currentSection?.prefix || 1) - 1
    
    const nextTopicNumber = maxTopicNumber + 1
    
    // Проверяем, чтобы номер соответствовал префиксу раздела
    const validatedTopicNumber = Math.max(nextTopicNumber, currentSection?.prefix || 1)
    
    setFormData({
      topic_number: validatedTopicNumber.toString(),
      title: '',
      description: '',
      content: `# Новая тема\n\nНачните писать содержание темы здесь...\n`,
      date: new Date().toISOString().split('T')[0],
      author: 'Преподаватель',
      keywords: [],
      order: topics.length + 1
    })
    
    setCurrentTopic(null)
    setIsEditing(true)
    setPreview(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditTopic = (topic: Topic) => {
    if (!topic || !topic.topic_number) {
      showMessage('error', 'Неверные данные темы')
      return
    }
    
    setCurrentTopic(topic)
    setFormData({
      topic_number: topic.topic_number.toString(),
      title: topic.title || '',
      description: topic.description || '',
      content: topic.content || topic.body || '',
      date: topic.date || new Date().toISOString().split('T')[0],
      author: topic.author || 'Преподаватель',
      keywords: topic.keywords || [],
      order: topic.order || 1
    })
    setIsEditing(true)
    setPreview(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteTopic = async (id: number) => {
    if (!id || isNaN(id)) {
      showMessage('error', 'Неверный ID темы')
      return
    }

    if (!confirm(`Удалить тему ${id}?`)) return

    try {
      const response = await fetch(`/api/github/topics?section=${selectedSection}&id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showMessage('success', `Тема ${id} удалена`)
        loadSectionTopics()
        if (currentTopic?.topic_number === id) {
          setCurrentTopic(null)
          setIsEditing(false)
        }
      } else {
        const errorData = await response.json()
        showMessage('error', errorData.error || 'Ошибка удаления')
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
      showMessage('error', 'Ошибка соединения')
    }
  }

  const handleSaveTopic = async () => {
    if (!formData.title.trim()) {
      showMessage('error', 'Введите название темы')
      return
    }

    if (!formData.topic_number.trim()) {
      showMessage('error', 'Введите номер темы')
      return
    }

    const topicNumber = parseInt(formData.topic_number)
    if (isNaN(topicNumber) || topicNumber <= 0) {
      showMessage('error', 'Номер темы должен быть положительным числом')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/github/topics`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_number: topicNumber,
          title: formData.title,
          description: formData.description,
          content: formData.content,
          date: formData.date,
          author: formData.author,
          keywords: formData.keywords,
          section: selectedSection,
          order: formData.order
        })
      })

      // Сначала получаем текст ответа
      const responseText = await response.text()
      let data: any
      
      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error('Неверный формат ответа от сервера')
      }

      if (response.ok) {
        const data = await response.json()
        
        showMessage('success', data.message || 'Тема сохранена')
        
        // Обновляем список тем
        await loadSectionTopics()
        
        // Вызываем ревалидацию кэша
        try {
          await fetch('/api/revalidate-topic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              section: selectedSection,
              topicNumber: topicNumber,
              secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'dev-secret'
            })
          })
        } catch (revalidateError) {
          console.log('Ревалидация не удалась, но это не критично')
        }
        
        // Обновляем текущую тему
        setCurrentTopic(data.topic || {
          id: topicNumber,
          topic_number: topicNumber,
          title: formData.title,
          description: formData.description,
          content: formData.content,
          body: formData.content,
          date: formData.date,
          author: formData.author,
          keywords: formData.keywords,
          section: selectedSection,
          order: formData.order
        })
        
        setIsEditing(false)
        
        // Опционально: вызываем ревалидацию через отдельный запрос
        try {
          await fetch(`/api/revalidate?path=/${selectedSection}`, { method: 'POST' })
          console.log('Ревалидация страницы раздела')
        } catch (revalidateError) {
          console.log('Ревалидация не удалась, но это не критично')
        }
        
      } else {
        // ОШИБКА
        showMessage('error', data.error || 'Ошибка сохранения')
      }
    } catch (error: any) {
      console.error('Ошибка сохранения:', error)
      showMessage('error', error.message || 'Ошибка соединения с сервером')
    } finally {
      setSaving(false)
    }
  }

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, newKeyword.trim()]
      })
      setNewKeyword('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKeyword.trim()) {
      e.preventDefault()
      handleAddKeyword()
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(topics, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `topics-${selectedSection}-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (Array.isArray(data)) {
        let importedCount = 0
        for (const topic of data) {
          if (topic && topic.topic_number) {
            const response = await fetch(`/api/sections/${selectedSection}/topics`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                topic_number: topic.topic_number,
                title: topic.title || '',
                description: topic.description || '',
                content: topic.content || topic.body || '',
                date: topic.date || new Date().toISOString().split('T')[0],
                author: topic.author || 'Преподаватель',
                keywords: topic.keywords || [],
                order: topic.order || topic.topic_number
              })
            })
            
            if (response.ok) {
              importedCount++
            }
          }
        }
        showMessage('success', `Импортировано ${importedCount} тем`)
        loadSectionTopics()
      }
    } catch (error) {
      showMessage('error', 'Ошибка импорта файла')
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const insertTextAtCursor = (text: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const currentText = formData.content
    
    let textToInsert = text
    if (selectedText) {
      if (text === '**жирный текст**') {
        textToInsert = `**${selectedText}**`
      } else if (text === '*курсивный текст*') {
        textToInsert = `*${selectedText}*`
      } else if (text === '![alt](url)') {
        textToInsert = `![${selectedText}](url)`
      }
    }
    
    const newText = currentText.substring(0, start) + textToInsert + currentText.substring(end)
    
    setFormData({ ...formData, content: newText })
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = selectedText ? start + textToInsert.length : start + textToInsert.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Пожалуйста, загрузите изображение')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Размер файла не должен превышать 5MB')
      return
    }

    setUploadingImage(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (response.ok && data.url) {
        const markdownImage = `\n![Описание изображения](${data.url})\n`
        insertTextAtCursor(markdownImage)
        showMessage('success', 'Изображение загружено')
      } else {
        showMessage('error', data.error || 'Ошибка загрузки изображения')
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      showMessage('error', 'Ошибка загрузки изображения')
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  const insertLink = () => {
    const linkText = prompt('Введите текст ссылки:', 'Пример ссылки')
    const linkUrl = prompt('Введите URL:', 'https://example.com')
    
    if (linkText && linkUrl) {
      const linkMarkdown = `[${linkText}](${linkUrl})`
      insertTextAtCursor(linkMarkdown)
    }
  }

  const insertBold = () => {
    insertTextAtCursor('**жирный текст**')
  }

  const insertItalic = () => {
    insertTextAtCursor('*курсивный текст*')
  }

  const renderPreview = () => {
    return (
      <div className="prose prose-sm sm:prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ 
          __html: (formData.content || '')
            .replace(/# (.*?)(\n|$)/g, '<h1 class="text-2xl sm:text-3xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4">$1</h1>')
            .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl sm:text-2xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">$2</h2>')
            .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">$3</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-3 sm:my-4 rounded-lg max-w-full" />')
        }} />
      </div>
    )
  }

  const renderTopicContent = (topic: Topic) => {
    const content = topic.content || topic.body || ''
    if (!content) return <p className="text-gray-500">Контент отсутствует</p>
    
    return (
      <div className="prose prose-sm sm:prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ 
          __html: content
            .replace(/# (.*?)(\n|$)/g, '<h1 class="text-2xl sm:text-3xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4">$1</h1>')
            .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl sm:text-2xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">$1</h2>')
            .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-3 sm:my-4 rounded-lg max-w-full" />')
        }} />
      </div>
    )
  }

  const getCurrentSection = () => {
    return sections.find(s => s.id === selectedSection)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="mb-3 sm:mb-4 text-blue-600 hover:text-blue-800 flex items-center text-sm sm:text-base"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Назад к главной админке
          </button>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div className="w-full lg:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                📝 Редактор тем курса
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Создание и редактирование учебных материалов
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <button
                onClick={loadSectionTopics}
                className="flex-1 lg:flex-none bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center text-sm sm:text-base"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Обновить
              </button>
              <button
                onClick={handleExport}
                className="flex-1 lg:flex-none bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center text-sm sm:text-base"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Экспорт
              </button>
              
              <label className="flex-1 lg:flex-none bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center cursor-pointer text-sm sm:text-base">
                <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Импорт
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImport}
                  accept=".json"
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {/* Выбор раздела с количеством тем */}
          <div className="mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Выберите раздел:</h3>
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setSelectedSection(section.id)
                    setCurrentTopic(null)
                    setIsEditing(false)
                    setPreview(false)
                  }}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium flex items-center gap-1 sm:gap-2 transition-all text-sm sm:text-base ${
                    selectedSection === section.id
                      ? `bg-linear-to-r ${section.color} text-white`
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {section.icon}
                  <span className="truncate max-w-20 sm:max-w-none">{section.name}</span>
                  <span className="text-xs bg-black/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    {sectionStats[section.id] || 0}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
              <p className="mb-1">📁 Папка: <code className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">app/content/{selectedSection}/</code></p>
              <p>📝 Формат: <code className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">topic-[номер].md</code></p>
            </div>
          </div>
        </div>

        {/* Сообщения */}
        {message && (
          <div key={message.type} className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              )}
              <span className="text-sm sm:text-base">{message.text}</span>
            </div>
          </div>
        )}

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Левая колонка - список тем */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <div className="w-full sm:w-auto">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {getCurrentSection()?.name} - Темы
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Всего тем: {topics.length}
                  </p>
                </div>
                <button
                  onClick={handleCreateNew}
                  className="w-full sm:w-auto bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center text-sm sm:text-base"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Новая
                </button>
              </div>
              
              <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
                {loading ? (
                  <div key="loading" className="text-center py-6 sm:py-8">
                    <div className="inline-block animate-spin rounded-full h-5 sm:h-6 w-5 sm:w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 sm:mt-3 text-gray-500 text-sm">Загрузка...</p>
                  </div>
                ) : topics.length === 0 ? (
                  <div key="empty" className="text-center py-6 sm:py-8">
                    <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-500 text-sm">Темы не найдены</p>
                    <button
                      onClick={handleCreateNew}
                      className="mt-2 text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Создать первую тему
                    </button>
                  </div>
                ) : (
                  topics
                    .filter(topic => topic && topic.topic_number)
                    .map((topic) => (
                      <div
                        key={`topic-list-${topic.topic_number}`}
                        className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all ${
                          currentTopic?.topic_number === topic.topic_number
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setCurrentTopic(topic)
                          setIsEditing(false)
                          setPreview(false)
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                              <div className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-bold ${
                                currentTopic?.topic_number === topic.topic_number ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                №{topic.topic_number}
                                {topic.order && topic.order !== topic.topic_number && ` (${topic.order})`}
                              </div>
                              <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{topic.title}</h3>
                            </div>
                            {topic.description && (
                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{topic.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                              <span className="text-xs text-gray-500">
                                {new Date(topic.date).toLocaleDateString('ru-RU')}
                              </span>
                              <span className="text-xs text-gray-500 hidden sm:inline">•</span>
                              <span className="text-xs text-gray-500">{topic.author}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-1 sm:ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditTopic(topic)
                              }}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Редактировать"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTopic(topic.topic_number)
                              }}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Удалить"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-500">
                  <span>Тем в разделе: {topics.length}</span>
                  <span>Всего тем на сайте: {Object.values(sectionStats).reduce((a, b) => a + b, 0)}</span>
                </div>
              </div>
            </div>
            
            {/* Быстрые действия */}
            {currentTopic && currentTopic.topic_number && (
              <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                <h3 className="font-semibold mb-3 sm:mb-4">Быстрые действия</h3>
                <div className="space-y-2 sm:space-y-3">
                  <a
                    href={`/${currentTopic.section}#topic-${currentTopic.topic_number}`}
                    target="_blank"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center text-sm sm:text-base"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Просмотреть тему на сайте
                  </a>
                  
                  <button
                    onClick={() => handleEditTopic(currentTopic)}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center text-sm sm:text-base"
                  >
                    ✏️ Редактировать тему
                  </button>
                  
                  <button
                    onClick={() => handleDeleteTopic(currentTopic.topic_number)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center text-sm sm:text-base"
                  >
                    🗑️ Удалить тему
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка - редактор/просмотр */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <div key="editor" className="bg-white rounded-xl shadow">
                <div className="border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 gap-3 sm:gap-0">
                    <div className="w-full sm:w-auto">
                      <h2 className="text-lg sm:text-xl font-semibold">
                        {currentTopic ? `Редактирование темы №${currentTopic.topic_number}` : 'Создание новой темы'}
                      </h2>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                        <div className={`px-2 sm:px-3 py-1 rounded-full bg-linear-to-r ${getCurrentSection()?.color} bg-opacity-10 w-fit`}>
                          <span className={`text-xs sm:text-sm font-bold bg-linear-to-r ${getCurrentSection()?.color} bg-clip-text text-transparent`}>
                            Раздел: {getCurrentSection()?.name}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          Сохраняется в: app/content/{selectedSection}/topic-{formData.topic_number}.md
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setPreview(!preview)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base"
                      >
                        {preview ? 'Редактировать' : 'Предпросмотр'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setPreview(false)
                        }}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  {preview ? (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className={`px-2 sm:px-3 py-1 rounded-full bg-linear-to-r ${
                            getCurrentSection()?.color
                          } bg-opacity-10 w-fit`}>
                            <span className={`text-xs sm:text-sm font-bold bg-linear-to-r ${
                              getCurrentSection()?.color
                            } bg-clip-text text-transparent`}>
                              {getCurrentSection()?.name}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500">Тема №{formData.topic_number} • Порядок: {formData.order}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{formData.title || 'Новая тема'}</h3>
                        {formData.description && (
                          <p className="text-gray-600 mb-4 sm:mb-6">{formData.description}</p>
                        )}
                        <div className="border-t border-gray-200 pt-4 sm:pt-6">
                          {renderPreview()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Номер темы *
                          </label>
                          <input
                            type="number"
                            value={formData.topic_number}
                            onChange={(e) => setFormData({ ...formData, topic_number: e.target.value })}
                            min={getCurrentSection()?.prefix || 1}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                            placeholder={String(getCurrentSection()?.prefix || 1)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Уникальный номер темы в разделе {getCurrentSection()?.name}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Порядковый номер
                          </label>
                          <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                            min="1"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Для сортировки в разделе (меньше число = выше в списке)
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Дата
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Название темы *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                          placeholder="Теоретические основы пожарной безопасности"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Краткое описание
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                          placeholder="Основные понятия и определения..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Автор
                        </label>
                        <input
                          type="text"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Ключевые слова
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2 mb-3">
                          <input
                            type="text"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                            placeholder="Введите ключевое слово"
                          />
                          <button
                            onClick={handleAddKeyword}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base"
                          >
                            Добавить
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {Array.isArray(formData.keywords) && formData.keywords.map((keyword, index) => (
                            <span
                              key={`keyword-${index}`}
                              className="inline-flex items-center bg-red-100 text-red-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm"
                            >
                              {keyword}
                              <button
                                type="button"
                                onClick={() => handleRemoveKeyword(keyword)}
                                className="ml-1 sm:ml-2 text-red-600 hover:text-red-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Упрощенная панель инструментов Markdown */}
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Инструменты форматирования</h4>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <button
                            onClick={insertBold}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-xs sm:text-sm"
                            title="Жирный текст"
                          >
                            <Bold className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Жирный
                          </button>
                          <button
                            onClick={insertItalic}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-xs sm:text-sm"
                            title="Курсив"
                          >
                            <Italic className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Курсив
                          </button>
                          <button
                            onClick={insertLink}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-xs sm:text-sm"
                            title="Вставить ссылку"
                          >
                            <Link className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Ссылка
                          </button>
                          <label className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center cursor-pointer text-xs sm:text-sm">
                            <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {uploadingImage ? 'Загрузка...' : 'Изображение'}
                            <input
                              type="file"
                              ref={imageInputRef}
                              onChange={handleUploadImage}
                              accept="image/*"
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 sm:mt-3">
                          Поддерживается: # заголовок, **жирный**, *курсив*, [ссылки](url), ![изображения](url)
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 sm:mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Содержание (Markdown)
                          </label>
                          <span className="text-xs text-gray-500">
                            Используйте выделение текста перед применением форматирования
                          </span>
                        </div>
                        <textarea
                          name="content"
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          rows={12}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-xs sm:text-sm"
                          placeholder="# Заголовок\n\nНачните писать содержание темы здесь..."
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                        <button
                          onClick={handleSaveTopic}
                          disabled={saving}
                          className="flex-1 bg-red-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                              Сохранение...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              {currentTopic ? 'Обновить тему' : 'Сохранить тему'}
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => setPreview(true)}
                          className="px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm sm:text-base"
                        >
                          Предпросмотр
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : currentTopic && currentTopic.topic_number ? (
              <div key={`topic-view-${currentTopic.topic_number}`} className="bg-white rounded-xl shadow p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <div className="w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className={`px-2 sm:px-3 py-1 rounded-full bg-linear-to-r ${
                        getCurrentSection()?.color
                      } bg-opacity-10 w-fit`}>
                        <span className={`text-xs sm:text-sm font-bold bg-linear-to-r ${
                          getCurrentSection()?.color
                        } bg-clip-text text-transparent`}>
                          {getCurrentSection()?.name}
                        </span>
                      </div>
                      <div className="bg-red-100 text-red-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-base sm:text-lg font-bold mr-3 sm:mr-4">
                        Тема №{currentTopic.topic_number}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{currentTopic.title}</h2>
                    </div>
                    
                    {currentTopic.description && (
                      <p className="text-gray-600 text-base sm:text-lg mb-3 sm:mb-4">{currentTopic.description}</p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center text-gray-500 mb-4 sm:mb-6 gap-1 sm:gap-0">
                      <div className="flex items-center mr-0 sm:mr-6">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="text-sm">{currentTopic.date}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="text-sm">{currentTopic.author}</span>
                      </div>
                      <div className="flex items-center ml-0 sm:ml-6">
                        <span className="text-xs sm:text-sm">Порядок: {currentTopic.order || currentTopic.topic_number}</span>
                      </div>
                    </div>
                    
                    {currentTopic.keywords && currentTopic.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                        {currentTopic.keywords.map((keyword, index) => (
                          <span
                            key={`current-keyword-${index}`}
                            className="bg-gray-100 text-gray-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      <p>📂 Хранится в: <code className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">app/content/{currentTopic.section}/topic-{currentTopic.topic_number}.md</code></p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEditTopic(currentTopic)}
                    className="w-full sm:w-auto bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-red-700 text-sm sm:text-base"
                  >
                    ✏️ Редактировать
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  {renderTopicContent(currentTopic)}
                </div>
              </div>
            ) : (
              <div key="empty-state" className="bg-white rounded-xl shadow p-6 sm:p-8 md:p-12 text-center">
                <FolderOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  Выберите тему для просмотра
                </h3>
                <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                  Выберите существующую тему из списка слева или создайте новую, чтобы начать работу.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-red-700 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                  Создать первую тему в разделе "{getCurrentSection()?.name}"
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Инструкция */}
        <div className="mt-6 sm:mt-8 bg-red-50 rounded-xl p-4 sm:p-6">
          <h3 className="font-semibold text-red-800 mb-3 sm:mb-4 text-sm sm:text-base">📋 Новая структура хранения:</h3>
          <pre className="text-xs bg-white p-2 sm:p-3 rounded-lg overflow-x-auto">
{`app/content/
├── fires/           # Раздел "Пожары" (темы 1-26)
│   ├── topic-1.md
│   ├── topic-2.md
│   └── ...
├── emergency/       # Раздел "Чрезвычайные ситуации" (темы 101-199)
│   ├── topic-101.md
│   └── ...
├── education/       # Раздел "Образование" (темы 201-299)
│   └── ...
└── protection/      # Раздел "Защита" (темы 301-399)
    └── ...

Каждая тема — отдельный .md файл с frontmatter!`}
          </pre>
        </div>
      </div>
    </div>
  )
}