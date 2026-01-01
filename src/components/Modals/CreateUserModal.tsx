import { useState } from 'react';
import { ArrowRight, Check, ChevronsUpDown, X, User, Shield, Building2, Crown, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAppConfigStore } from '@/config/store/useAppConfigStore';
import { useDepartments } from '@/hooks/queries/useDepartmentQueries';
import { useCreateUser } from '@/hooks/mutations/useUserManagementMutation';
import type { UserRole } from '@/config/types/commonTypes';
import type { Department } from '@/config/types/userManagementTypes';

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Role information mapping
const roleInfo: Record<UserRole, { label: string; description: string; icon: any }> = {
  USER: {
    label: 'User',
    description: 'Basic access with ACL-based permissions',
    icon: User,
  },
  DEPARTMENT_OWNER: {
    label: 'Department Owner',
    description: 'Manages a single department',
    icon: Building2,
  },
  ADMIN: {
    label: 'Admin',
    description: 'Manages multiple departments',
    icon: Shield,
  },
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Full system access to everything',
    icon: Crown,
  },
};

export function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [openDeptCombo, setOpenDeptCombo] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '' as UserRole | '',
    departments: [] as string[],
    department: '',
  });

  const { userList, addUser } = useAppConfigStore();

  // Fetch departments using the common hook
  const { data: departmentsData, isLoading: loadingDepartments } = useDepartments(
    { activeOnly: true },
    { enabled: open }
  );
  const departments = departmentsData?.data || [];

  // Create user mutation
  const createUserMutation = useCreateUser();

  const steps = [
    { number: 1, title: 'User Details' },
    { number: 2, title: 'Role & Access' },
  ];

  const handleNext = () => {
    handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Prepare payload based on role
    const payload: any = {
      username: formData.username,
      email: formData.email,
      role: formData.role,
    };

    // Add role-specific fields
    if (formData.role === 'ADMIN' && formData.departments.length > 0) {
      payload.departments = formData.departments;
    } else if (formData.role === 'DEPARTMENT_OWNER' && formData.department) {
      payload.departments = [formData.department];
    }

    createUserMutation.mutate(payload, {
      onSuccess: (data) => {
        // Add user to store
        addUser({
          id: data.data.userId,
          username: data.data.username,
          email: data.data.email,
          profilePic: ''
        });

        // Reset form
        setFormData({
          username: '',
          email: '',
          role: '',
          departments: [],
          department: '',
        });
        setCurrentStep(1);
        onOpenChange(false);
      },
    });
  };

  const canProceed = () => {
    if (currentStep === 1) {
      // Check if username or email already exists
      if (!formData.username || !formData.email) return false;

      const usernameExists = userList.some(
        user => user.username.toLowerCase() === formData.username.toLowerCase()
      );
      const emailExists = userList.some(
        user => user.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (usernameExists || emailExists) {
        return false;
      }

      return true;
    }
    
    if (currentStep === 2) {
      if (!formData.role) return false;
      if (formData.role === 'ADMIN') return formData.departments.length > 0;
      if (formData.role === 'DEPARTMENT_OWNER') return !!formData.department;
      return true;
    }
    return false;
  };

  const getValidationMessage = () => {
    if (currentStep === 1 && formData.username && formData.email) {
      const usernameExists = userList.some(
        user => user.username.toLowerCase() === formData.username.toLowerCase()
      );
      const emailExists = userList.some(
        user => user.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (usernameExists) return 'Username already exists';
      if (emailExists) return 'Email already exists';
    }
    return null;
  };

  const toggleDepartment = (deptId: string) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(deptId)
        ? prev.departments.filter(id => id !== deptId)
        : [...prev.departments, deptId]
    }));
  };

  const getRoleIcon = (role: UserRole | '') => {
    if (!role) return null;
    const Icon = roleInfo[role].icon;
    return <Icon className="w-4 h-4" />;
  };

  const validationMessage = getValidationMessage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 gap-0">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
          <p className="text-sm text-gray-500 mt-0.5">Add a new user to your organization</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="mx-4 w-12 h-0.5 bg-gray-200">
                  <div
                    className={`h-full transition-all ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    style={{ width: currentStep > step.number ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Form Content Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-5">
          {/* Step 1: User Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  className="mt-1.5 h-10 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@company.com"
                  className="mt-1.5 h-10 bg-white"
                />
              </div>

              {validationMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{validationMessage}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Role Selection and Permissions */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Role Dropdown */}
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  User Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    role: value as UserRole,
                    departments: [],
                    department: '',
                  }))}
                >
                  <SelectTrigger id="role" className="mt-1.5 h-10 bg-white">
                    <SelectValue placeholder="Select a role">
                      {formData.role && (
                        <div className="flex items-center gap-2">
                          {getRoleIcon(formData.role)}
                          <span>{roleInfo[formData.role].label}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(roleInfo) as UserRole[]).map((role) => {
                      const Icon = roleInfo[role].icon;
                      return (
                        <SelectItem key={role} value={role} className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-gray-600" />
                            <div>
                              <div className="font-medium text-sm">{roleInfo[role].label}</div>
                              <div className="text-xs text-gray-500">{roleInfo[role].description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Admin - Multiple Departments */}
              {formData.role === 'ADMIN' && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Assign Departments
                  </Label>
                  
                  {formData.departments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                      {formData.departments.map((deptId) => {
                        const dept = departments.find((d: Department) => d._id === deptId);
                        return (
                          <div
                            key={deptId}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                          >
                            <span>{dept?.name}</span>
                            <button
                              onClick={() => toggleDepartment(deptId)}
                              className="hover:bg-blue-200 rounded p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Popover open={openDeptCombo} onOpenChange={setOpenDeptCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-10 text-sm font-normal mt-1.5 bg-white"
                        disabled={loadingDepartments}
                      >
                        <span className="text-gray-500">
                          {loadingDepartments ? 'Loading...' : 
                           formData.departments.length > 0
                            ? `${formData.departments.length} selected`
                            : "Select departments"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search..." className="h-9" />
                        <CommandEmpty>No department found.</CommandEmpty>
                        <CommandGroup className="max-h-48 overflow-auto">
                          {departments.map((dept: Department) => (
                            <CommandItem
                              key={dept._id}
                              value={dept.name}
                              onSelect={() => toggleDepartment(dept._id)}
                              className="py-2"
                            >
                              <Checkbox
                                checked={formData.departments.includes(dept._id)}
                                className="mr-2"
                              />
                              <span className="flex-1">{dept.name}</span>
                              {formData.departments.includes(dept._id) && (
                                <Check className="h-4 w-4 text-blue-600" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Department Owner - Single Department */}
              {formData.role === 'DEPARTMENT_OWNER' && (
                <div>
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                    Select Department
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                    disabled={loadingDepartments}
                  >
                    <SelectTrigger id="department" className="mt-1.5 h-10 bg-white">
                      <SelectValue placeholder={loadingDepartments ? "Loading..." : "Choose a department"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept: Department) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* User & Super Admin Info */}
              {(formData.role === 'USER' || formData.role === 'SUPER_ADMIN') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                  <div className="flex gap-2.5">
                    {formData.role === 'USER' ? (
                      <User className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Crown className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {formData.role === 'USER' ? 'ACL-Based Permissions' : 'Full System Access'}
                      </p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        {formData.role === 'USER' 
                          ? 'This user will have basic access controlled by ACL permissions.'
                          : 'This user will have complete access to all features and data.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handleBack}
            variant="ghost"
            disabled={currentStep === 1 || createUserMutation.isPending}
            className="h-9 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            Back
          </Button>
          
          <Button
            onClick={currentStep === 1 ? () => setCurrentStep(2) : handleNext}
            disabled={!canProceed() || createUserMutation.isPending}
            className="h-9 px-5 bg-blue-600 hover:bg-blue-700"
          >
            {createUserMutation.isPending ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {currentStep === 1 ? 'Continue' : 'Create User'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}