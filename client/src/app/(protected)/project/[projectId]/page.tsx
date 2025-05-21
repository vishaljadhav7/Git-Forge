"use client"

import React, { useState } from "react"
import { useFetchAllCommitsQuery } from "@/store/features/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch" 
import { GitBranch, Search, RefreshCcw, Github, Calendar, Hash, FileText, Download, BrainCircuit } from "lucide-react"
import { format } from "date-fns"

const Project = ({ params }: { params: Promise<{ projectId: string }> }) => {
  const resolvedParams = React.use(params)
  const { projectId } = resolvedParams
  const [showQueryInput, setShowQueryInput] = useState(false)
  const [queryText, setQueryText] = useState("")

  const { data, isLoading, isError, refetch } = useFetchAllCommitsQuery({ projectId: projectId })

  const handleLoadRepo = () => {
    refetch()
  }

  const handlePullLatestCommits = () => {

    console.log("Pulling latest commits...")
  }

  const handleQueryRepo = () => {
    
    console.log("Querying repo with:", queryText)
  }

  const formatCommitHash = (hash: string) => {
    return hash.substring(0, 7)
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
       
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Github className="h-6 w-6" />
              Repository Explorer
            </CardTitle>
            <CardDescription className="text-base">
              It might take some time to load the repository depending on its size (approximately 1-2 minutes to process
              and query)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch id="query-mode" checked={showQueryInput} onCheckedChange={setShowQueryInput} />
                  <label htmlFor="query-mode" className="text-sm font-medium cursor-pointer">
                    Enable AI query on repository
                  </label>
                </div>
                <Button onClick={handlePullLatestCommits} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Pull Latest Commits
                </Button>
              </div>

              {showQueryInput && (
                <div className="flex gap-3 pt-2">
                  <div className="relative flex-1">
                    <BrainCircuit className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Query on repo with AI"
                      className="pl-10"
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleQueryRepo} className="gap-2">
                    <Search className="h-4 w-4" />
                    Query on Repo
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t">
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <RefreshCcw className="h-3 w-3" />
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </CardFooter>
        </Card>

     
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Commit History
            </h2>
            <div className="flex items-center gap-3">
              <Button onClick={handleLoadRepo} variant="outline" size="sm" className="gap-2">
                <RefreshCcw className="h-3.5 w-3.5" />
                Load Repo
              </Button>
              <Badge variant="outline" className="text-sm">
                {data?.length || 0} commits
              </Badge>
            </div>
          </div>

          {isLoading ? (
   
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-20 w-full mt-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
         
            <Card className="border-none shadow-sm bg-red-50">
              <CardContent className="p-6">
                <p className="text-red-600">Failed to load commits. Please try again.</p>
              </CardContent>
            </Card>
          ) : (
        
            <div className="space-y-4">
              {data?.map((commit) => (
                <Card key={commit.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage
                          src={commit.commitAuthorAvatar || "/placeholder.svg"}
                          alt={commit.commitAuthorName}
                        />
                        <AvatarFallback>{commit.commitAuthorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="font-medium text-lg">{commit.commitAuthorName}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(commit.commitDate), "MMM d, yyyy h:mm a")}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge variant="outline" className="font-mono text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {formatCommitHash(commit.commitHash)}
                          </Badge>
                          <span className="text-sm font-medium">{commit.commitMessage}</span>
                        </div>

                        <Separator className="my-3" />

                        <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-slate-500 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm text-slate-700 leading-relaxed">{commit.summary}</div>
                              <div className="mt-2 flex items-center text-xs text-slate-500">
                                <BrainCircuit className="h-3 w-3 mr-1" />
                                <span>AI-generated commit analysis</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Project
