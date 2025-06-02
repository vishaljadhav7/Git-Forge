"use client"

import type React from "react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Code2,
  MessageSquare,
  BrainCircuit,
  Hash,
  X,
  Save,
} from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import {  oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import MDEditor from "@uiw/react-md-editor"
import { useSaveQuestionMutation } from "@/store/features/api"

interface FileReference {
  filename: string
  relevantLines: string
  codeSnippet: string
  explanation: string
  language: string
}

interface QueryResponse {
  question: string
  answer: string
  fileReferences: FileReference[]
  summary?: string
  confidence?: string
  additionalNotes?: string
}

interface AIQueryModalProps {
  isOpen: boolean
  onClose: () => void
  data: QueryResponse | null
  projectId? : string;
  isViewMode : boolean;
}

const AIQueryModal: React.FC<AIQueryModalProps> = ({ isOpen, onClose, data, projectId, isViewMode}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<"answer" | "files">("answer")
  const [saveQuestion, {isLoading}] = useSaveQuestionMutation()

  // Handle escape key

  if (!isOpen || !data) return null

  const getLanguageIcon = (language: string) => {
    const iconMap: { [key: string]: string } = {
      typescript: "TS",
      javascript: "JS",
      python: "PY",
      json: "{}",
      dockerfile: "🐳",
      hcl: "HCL",
      yaml: "YML",
      html: "HTML",
      css: "CSS",
      jsx: "JSX",
      tsx: "TSX",
    }
    return iconMap[language.toLowerCase()] || "📄"
  }

  const getLanguageBadgeColor = (language: string) => {
    const colorMap: { [key: string]: string } = {
      typescript: "bg-blue-100 text-blue-800 border-blue-200",
      javascript: "bg-yellow-100 text-yellow-800 border-yellow-200",
      python: "bg-green-100 text-green-800 border-green-200",
      json: "bg-purple-100 text-purple-800 border-purple-200",
      dockerfile: "bg-cyan-100 text-cyan-800 border-cyan-200",
      hcl: "bg-orange-100 text-orange-800 border-orange-200",
      yaml: "bg-red-100 text-red-800 border-red-200",
      html: "bg-orange-100 text-orange-800 border-orange-200",
      css: "bg-pink-100 text-pink-800 border-pink-200",
    }
    return colorMap[language.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const currentFile = data.fileReferences?.[selectedFileIndex]

  const handleSaveAnswer = async () => {
    if(isViewMode || !projectId) return;
    try {
      const questionDetails = { question : data.question, projectId, answer : data.answer, fileReferences : data.fileReferences}
      await saveQuestion(questionDetails).unwrap();     
    } catch (error) {
     console.error(error);
    }finally{
      onClose();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
        <div
          className={`w-[80vw] h-[85vh] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col transition-all duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 pb-3 border-b bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-t-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1 pr-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BrainCircuit className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">AI Repository Analysis</h2>

                  {!isViewMode && <Button
                    onClick={handleSaveAnswer}
                    variant="outline"
                    size="sm"
                    className="ml-auto gap-2 bg-white hover:bg-gray-50"
                    disabled={isLoading}
                  >
                   {isLoading ?
                    "Saving ..." : 
                     <>
                   <Save className="h-4 w-4" />
                    Save Answer
                    </>}
                  </Button>}

                  <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-base text-gray-700 leading-relaxed font-medium">{data.question}</p>

                {(data.confidence || data.summary) && (
                  <div className="flex gap-2">
                    {data.confidence && (
                      <Badge
                        variant="outline"
                        className={`${
                          data.confidence === "high"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : data.confidence === "medium"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        Confidence: {data.confidence}
                      </Badge>
                    )}
                    {data.summary && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Summary Available
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b bg-gray-50">
            <div className="flex">
              <button
                onClick={() => setActiveTab("answer")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "answer"
                    ? "border-blue-500 text-blue-600 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Answer & Analysis
                </div>
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "files"
                    ? "border-blue-500 text-blue-600 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  File References ({data.fileReferences?.length || 0})
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "answer" && (
              <div className="h-full overflow-y-auto p-6 space-y-6">
                {/* Main Answer */}
                <Card className="border-none shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="prose prose-gray max-w-none">
                      <MDEditor.Markdown
                        source={data.answer}
                        style={{
                          backgroundColor: "transparent",
                          color: "inherit",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                {data.summary && (
                  <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Hash className="h-4 w-4 text-blue-600" />
                        Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-700 leading-relaxed">{data.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Notes */}
                {data.additionalNotes && (
                  <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-amber-600" />
                        Additional Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-700 leading-relaxed">{data.additionalNotes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "files" && (
              <div className="h-full flex flex-col">
                {data.fileReferences && data.fileReferences.length > 0 ? (
                  <>

                    {/* File Tabs */}
                    {data.fileReferences.length > 1 && (
                      <div className="p-4 border-b bg-white">
                        <div className="flex gap-2 overflow-x-auto">
                          {data.fileReferences.map((file, index) => (
                            <Button
                              key={index}
                              variant={selectedFileIndex === index ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedFileIndex(index)}
                              className="flex items-center gap-2 whitespace-nowrap"
                            >
                              <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs font-mono">
                                {getLanguageIcon(file.language)}
                              </div>
                              <span className="truncate max-w-32">{file.filename}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Current File Content */}
                    {currentFile && (
                      <div className="flex-1 overflow-y-auto p-2">
                      {/* {file name} */}
                        <Card className="border-none shadow-sm">
                          <CardHeader className="border-b bg-gray-50/50">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-gray-600" />
                                {currentFile.filename}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getLanguageBadgeColor(currentFile.language)}>
                                  {currentFile.language.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Lines {currentFile.relevantLines}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>

                      {/* {code's explanation} */}
                          <CardContent className="p-4">
                            <div className="p-4 bg-blue-50/50 border-l-4 border-l-blue-400 rounded-r">
                              <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                              <p className="text-blue-800 text-sm leading-relaxed">{currentFile.explanation}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* {display code} */}
                        <Card className="border-none shadow-sm">
                          <div className="relative">
                            <div className="bg-gray-900 text-gray-100 text-xs px-4 py-2 border-b border-gray-700 rounded-t">
                              <span className="font-mono">{currentFile.filename}</span>
                            </div>
                            <div className="overflow-x-auto max-h-96">
                              <SyntaxHighlighter
                                language={currentFile.language}
                                style={oneLight}
                                customStyle={{
                                  margin: 0,
                                  padding: "1rem",
                                  borderRadius: "0 0 0.375rem 0.375rem",
                                  fontSize: "0.875rem",
                                  lineHeight: "1.5",
                                }}
                                showLineNumbers
                                wrapLongLines
                                lineProps={{
                                  style: {
                                    wordBreak: "break-all",
                                    whiteSpace: "pre-wrap",
                                  },
                                }}
                              >
                                {currentFile.codeSnippet}
                              </SyntaxHighlighter>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No file references available for this query.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AIQueryModal
