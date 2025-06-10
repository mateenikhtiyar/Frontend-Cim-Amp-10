import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Users,
  Building2,
  BarChart3,
  FileText,
  Settings,
  Bell,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react"
import { AdminProtectedRoute } from "@/components/admin/protected-route"

export default function AdminDashboard() {
  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        {/* Admin Sidebar */}
        <div className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/admin/dashboard" className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Dashboard
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/admin/users" className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Users
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/admin/companies" className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Companies
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/admin/deals" className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Deals
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/admin/settings" className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </a>
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64">
          {/* Header */}
          <header className="h-16 border-b bg-white flex items-center justify-between px-6">
            <div className="flex items-center">
              <Button variant="outline" size="icon" className="mr-4 md:hidden">
                <span className="sr-only">Open menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="rounded-md border border-gray-200 pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <span className="h-8 w-8 rounded-full bg-blue-600 text-white grid place-items-center font-medium">A</span>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
              <p className="text-gray-500">Monitor and manage your platform's performance and users</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-green-500 flex items-center text-sm font-medium">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      12%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Users</p>
                    <h3 className="text-2xl font-bold">2,543</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-2 rounded-md">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-green-500 flex items-center text-sm font-medium">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      8%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Companies</p>
                    <h3 className="text-2xl font-bold">482</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-2 rounded-md">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-red-500 flex items-center text-sm font-medium">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      3%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Deals</p>
                    <h3 className="text-2xl font-bold">128</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-amber-100 p-2 rounded-md">
                      <DollarSign className="h-6 w-6 text-amber-600" />
                    </div>
                    <span className="text-green-500 flex items-center text-sm font-medium">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      24%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Revenue</p>
                    <h3 className="text-2xl font-bold">$1.2M</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="deals">Deals</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest platform activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                          >
                            <span className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 grid place-items-center font-medium text-sm">
                              {String.fromCharCode(64 + i)}
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {
                                  [
                                    "New user registered",
                                    "Deal approved",
                                    "Company profile updated",
                                    "New deal submitted",
                                    "User role changed",
                                  ][i - 1]
                                }
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{`${i} hour${i === 1 ? "" : "s"} ago`}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { title: "Add User", icon: Users },
                          { title: "Review Deals", icon: FileText },
                          { title: "System Settings", icon: Settings },
                          { title: "Generate Report", icon: BarChart3 },
                        ].map((action, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                          >
                            <action.icon className="h-5 w-5" />
                            <span>{action.title}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage platform users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>User management content would go here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deals">
                <Card>
                  <CardHeader>
                    <CardTitle>Deal Management</CardTitle>
                    <CardDescription>Monitor and manage active deals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Deal management content would go here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>View and generate platform reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Reports content would go here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
