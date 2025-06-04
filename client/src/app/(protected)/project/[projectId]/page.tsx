"use client";

import React, { useState } from "react";
import { useFetchAllCommitsQuery } from "@/store/features/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AIQueryModal from "@/components/custom/AIQueryModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  GitBranch,
  Search,
  RefreshCcw,
  Github,
  Calendar,
  Hash,
  FileText,
  BrainCircuit,
  Loader2Icon,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { useLoadGitHubRepoMutation , useUpdateCommitsMutation} from "@/store/features/api";
import axios from "axios";

const Project = ({ params }: { params: Promise<{ projectId: string }> }) => {
  const resolvedParams = React.use(params);
  const { projectId } = resolvedParams;
  const [showQueryInput, setShowQueryInput] = useState<boolean>(false);
  const [queryText, setQueryText] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [queryLoading, setQueryLoading] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [queryResponse, setQueryResponse] = useState(null);
  const [loadGithubRepo, { isLoading: repoLoading }] =
    useLoadGitHubRepoMutation();

  const { data, isLoading, isError } = useFetchAllCommitsQuery({
    projectId: projectId,
  });

  const [updateCommits, { isLoading : newCommitsLoading}] = useUpdateCommitsMutation()

  const handleLoadRepo = async () => {
    try {
      await updateCommits({projectId}).unwrap();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.message);
      }
    }
  };


  const handleQueryRepo = async () => {
    if (!queryText.trim()) return;

    setQueryLoading(true);
    try {
      const {data} = await axios.get(`${process.env.NEXT_PUBLIC_URL}/api/repo/query`, {
        params: {
          projectId,
          question: queryText,
        },
        withCredentials: true,
      });

      setQueryResponse(data.data); // or just data, depending on your API response structure
      setShowModal(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.message);
      }
    } finally {
      setQueryLoading(false);
    }
  };
  const formatCommitHash = (hash: string) => {
    return hash.substring(0, 7);
  };

  const handleSwitch = async () => {
    if (!branchName.trim()) return;
    try {
      await loadGithubRepo({ projectId, branchName }).unwrap();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error(error.response);
        }
      }
    } finally {
      setShowQueryInput((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Github className="h-5 w-5 sm:h-6 sm:w-6" />
              Repository Explorer
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              It might take some time to load the repository depending on its
              size (approximately 1-2 minutes to process and query)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Branch input and switch section */}
            <div className="space-y-4">
              {!showQueryInput &&<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                  <Input
                    placeholder="Enter branch name"
                    className="w-full sm:w-[250px]"
                    value={branchName}
                    onChange={(e) =>
                      setBranchName(e.target.value.toLocaleLowerCase())
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      id="query-mode"
                      className="cursor-pointer"
                      checked={showQueryInput}
                      onCheckedChange={handleSwitch}
                    />
                    <label
                      htmlFor="query-mode"
                      className="text-sm font-medium cursor-pointer whitespace-nowrap"
                    >
                      Enable AI query
                    </label>
                  </div>
                </div>
              </div>}

              {repoLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  <span>Loading repository...</span>
                </div>
              )}

              {/* AI Query section */}
              {showQueryInput && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <BrainCircuit className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Query repository with AI"
                        className="pl-10"
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        disabled={queryLoading}
                        onClick={handleQueryRepo}
                        className="gap-2 flex-1 sm:flex-none"
                      >
                        <Search className="h-4 w-4" />
                        {queryLoading ? "Loading..." : "Query Repo"}
                      </Button>
                      <Button
                        onClick={() => setShowModal(true)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View Results</span>
                      </Button>
                    </div>
                  </div>
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

        <AIQueryModal
          projectId={projectId}
          isViewMode={false}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          data={queryResponse}
        />

        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <GitBranch className="h-4 w-4 sm:h-5 sm:w-5" />
              Commit History
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button
                onClick={handleLoadRepo}
                variant="outline"
                size="sm"
                className="gap-2 w-full sm:w-auto"
                disabled={newCommitsLoading}
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${newCommitsLoading ? 'animate-spin' : ''}`} />
                {newCommitsLoading ? "Loading..." : "Load Recent Commits"}
              </Button>
              {!newCommitsLoading && (
                <Badge variant="outline" className="text-sm self-start sm:self-auto">
                  {data?.length || 0} commits
                </Badge>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-3 sm:gap-4">
                      <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
                      <div className="space-y-2 flex-1 min-w-0">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-16 sm:h-20 w-full mt-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="border-none shadow-sm bg-red-50">
              <CardContent className="p-4 sm:p-6">
                <p className="text-red-600 text-sm sm:text-base">
                  Failed to load commits. Please try again.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data?.map((commit) => (
                <Card
                  key={commit.id}
                  className="border-none shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-3 sm:gap-4">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border flex-shrink-0">
                        <AvatarImage
                          src={commit.commitAuthorAvatar || "/placeholder.svg"}
                          alt={commit.commitAuthorName}
                        />
                        <AvatarFallback>
                          {commit.commitAuthorName
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-col gap-2">
                          <div className="font-medium text-base sm:text-lg truncate">
                            {commit.commitAuthorName}
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">
                              {format(
                                new Date(commit.commitDate),
                                "MMM d, yyyy h:mm a"
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs w-fit"
                          >
                            <Hash className="h-3 w-3 mr-1" />
                            {formatCommitHash(commit.commitHash)}
                          </Badge>
                          <span className="text-sm font-medium break-words">
                            {commit.commitMessage}
                          </span>
                        </div>

                        <Separator className="my-3" />

                        <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-slate-700 leading-relaxed break-words">
                                {commit.summary}
                              </div>
                              <div className="mt-2 flex items-center text-xs text-slate-500">
                                <BrainCircuit className="h-3 w-3 mr-1 flex-shrink-0" />
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
  );
};

export default Project;