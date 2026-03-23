import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import { User, Bell, Shield, Eye, EyeOff, Phone, MessageCircle, Banknote, MapPin, FileText, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { showToast } from '@/lib/toast'
import axiosInstance from '@/lib/axios'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const profileSchema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  phone_number: z.string().optional(),
  whatsapp_number: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const bankSchema = z.object({
  bank_account_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_name: z.string().optional(),
  bank_code: z.string().optional(),
  raenest_account_id: z.string().optional(),
})

type BankFormData = z.infer<typeof bankSchema>

const Settings = () => {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/users/me/')
        setProfileData(response.data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        showToast.error('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Add underscore to unused error variables
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: _profileErrors }, setValue: setProfileValue, getValues } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: '',
      location: '',
      phone_number: '',
      whatsapp_number: '',
    },
  })

  // Add underscore to unused error variables
  const { register: registerBank, handleSubmit: handleBankSubmit, formState: { errors: _bankErrors }, setValue: setBankValue } = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bank_account_name: '',
      bank_account_number: '',
      bank_name: '',
      bank_code: '',
      raenest_account_id: '',
    },
  })

  // Update form values when profile data loads
  useEffect(() => {
    if (profileData) {
      setProfileValue('bio', profileData.bio || '')
      setProfileValue('location', profileData.location || '')
      setProfileValue('phone_number', profileData.phone_number || '')
      setProfileValue('whatsapp_number', profileData.whatsapp_number || '')
      setBankValue('bank_account_name', profileData.bank_account_name || '')
      setBankValue('bank_account_number', profileData.bank_account_number || '')
      setBankValue('bank_name', profileData.bank_name || '')
      setBankValue('bank_code', profileData.bank_code || '')
      setBankValue('raenest_account_id', profileData.raenest_account_id || '')
    }
  }, [profileData, setProfileValue, setBankValue])

  // Set phone number as WhatsApp number
  const setPhoneAsWhatsApp = () => {
    const phoneNumber = getValues('phone_number')
    if (phoneNumber) {
      setProfileValue('whatsapp_number', phoneNumber)
      showToast.success('WhatsApp number set to phone number')
    } else {
      showToast.error('Please enter a phone number first')
    }
  }

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      await axiosInstance.patch('/users/me/', {
        bio: data.bio,
        location: data.location,
        phone_number: data.phone_number,
        whatsapp_number: data.whatsapp_number,
      })
      showToast.success('Profile updated successfully')
      // Refresh profile data
      const response = await axiosInstance.get('/users/me/')
      setProfileData(response.data)
    } catch (error) {
      showToast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const onSubmitBank = async (data: BankFormData) => {
    setIsSaving(true)
    try {
      await axiosInstance.patch('/users/me/', {
        bank_account_name: data.bank_account_name,
        bank_account_number: data.bank_account_number,
        bank_name: data.bank_name,
        bank_code: data.bank_code,
        raenest_account_id: data.raenest_account_id,
      })
      showToast.success('Bank details updated successfully')
      // Refresh profile data
      const response = await axiosInstance.get('/users/me/')
      setProfileData(response.data)
    } catch (error) {
      showToast.error('Failed to update bank details')
    } finally {
      setIsSaving(false)
    }
  }

  const onSubmitPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const oldPassword = formData.get('old_password')
    const newPassword = formData.get('new_password')
    const confirmPassword = formData.get('confirm_password')

    if (newPassword !== confirmPassword) {
      showToast.error('Passwords do not match')
      return
    }

    if (newPassword && newPassword.toString().length < 6) {
      showToast.error('Password must be at least 6 characters')
      return
    }

    try {
      await axiosInstance.post('/auth/password-change/', {
        old_password: oldPassword,
        new_password: newPassword,
      })
      showToast.success('Password changed successfully')
      e.currentTarget.reset()
    } catch (error: any) {
      showToast.error(error.response?.data?.detail || 'Failed to change password')
    }
  }

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user?.username?.slice(0, 2).toUpperCase() || 'U'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted flex flex-wrap h-auto p-1 gap-1">
          <TabsTrigger value="profile" className="text-muted-foreground data-[state=active]:text-foreground">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="text-muted-foreground data-[state=active]:text-foreground">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="banking" className="text-muted-foreground data-[state=active]:text-foreground">
            <Banknote className="h-4 w-4 mr-2" />
            Banking
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-muted-foreground data-[state=active]:text-foreground">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Profile Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your basic information from registration
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info Card - Read Only */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {user?.first_name} {user?.last_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <User className="h-3 w-3" />
                      <span>@{user?.username}</span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="space-y-4">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-foreground border-b border-border pb-2">
                    Contact Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="text-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone_number"
                      {...registerProfile('phone_number')}
                      placeholder="+2348012345678"
                      className="bg-background border-border text-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your phone number for contact purposes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="whatsapp_number" className="text-foreground flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp Number
                      </Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={setPhoneAsWhatsApp}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Use Phone Number
                      </Button>
                    </div>
                    <Input
                      id="whatsapp_number"
                      {...registerProfile('whatsapp_number')}
                      placeholder="+2348012345678"
                      className="bg-background border-border text-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Add your WhatsApp number to enable chat continuation on WhatsApp
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-md font-semibold text-foreground border-b border-border pb-2">
                    Additional Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      {...registerProfile('location')}
                      placeholder="City, Country"
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Bio
                    </Label>
                    <textarea
                      id="bio"
                      {...registerProfile('bio')}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmitPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old_password" className="text-foreground">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="old_password"
                      name="old_password"
                      type={showOldPassword ? 'text' : 'password'}
                      className="bg-background border-border text-foreground pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                      {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password" className="text-foreground">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      name="new_password"
                      type={showNewPassword ? 'text' : 'password'}
                      className="bg-background border-border text-foreground pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-foreground">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="bg-background border-border text-foreground pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border mt-6">
            <CardHeader>
              <CardTitle className="text-foreground">Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banking Settings */}
        <TabsContent value="banking">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Bank Account Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add your bank account details to receive payments and withdrawals
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBankSubmit(onSubmitBank)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_account_name" className="text-foreground">Account Name</Label>
                  <Input
                    id="bank_account_name"
                    {...registerBank('bank_account_name')}
                    placeholder="John Doe"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_account_number" className="text-foreground">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    {...registerBank('bank_account_number')}
                    placeholder="1234567890"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name" className="text-foreground">Bank Name</Label>
                    <Input
                      id="bank_name"
                      {...registerBank('bank_name')}
                      placeholder="First Bank"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_code" className="text-foreground">Bank Code (Optional)</Label>
                    <Input
                      id="bank_code"
                      {...registerBank('bank_code')}
                      placeholder="011"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="raenest_account_id" className="text-foreground">Raenest Account ID (Optional)</Label>
                  <Input
                    id="raenest_account_id"
                    {...registerBank('raenest_account_id')}
                    placeholder="Your Raenest account ID"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Bank Details'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates about your activity</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Task Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified about task status changes and applications</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Campaign Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified about campaign progress and contributions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Chat Messages</p>
                  <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Marketing Communications</p>
                  <p className="text-sm text-muted-foreground">Receive tips and updates about new features</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings