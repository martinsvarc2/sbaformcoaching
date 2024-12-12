'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type FormData = {
  firstName: string
  lastName: string
  phone: string
  email: string
  occupation: string
  monthlyIncome: string
  businessReason: string
  investment: string
  videosWatched: string
  socialHandle: string
}

type UTMData = {
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  occupation: '',
  monthlyIncome: '',
  businessReason: '',
  investment: '',
  videosWatched: '',
  socialHandle: '',
}

const sanitizeFormData = (data: FormData): FormData => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value).trim()])
  ) as FormData;
}

const totalSteps = 8

export default function MultiStepForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [progress, setProgress] = useState(0)
  const [hasEnteredName, setHasEnteredName] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const [countryCode, setCountryCode] = useState("+1")
  const [showPhoneError, setShowPhoneError] = useState(false); // Added phone error state
  const [shake, setShake] = useState(false); // Added shake state
  const [showEmailError, setShowEmailError] = useState(false); // Added email error state
  const [countdown, setCountdown] = useState<number | null>(null); // Added countdown state
  const [utmData, setUtmData] = useState<UTMData>({});

  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement)[]>([]);

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.firstName || !formData.lastName) {
          toast({
            title: "Please fill in all fields",
            description: "First name and last name are required",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.phone || !formData.email) {
          toast({
            title: "Please fill in all fields",
            description: "Phone number and email address are required",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.email.includes('@')) {
          setShowEmailError(true);
          return false;
        }
        return true;
      case 3:
        if (!formData.occupation) {
          toast({
            title: "Please fill out all fields",
            description: "Occupation is required",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 4:
        if (!formData.monthlyIncome) {
          toast({
            title: "Please select an option",
            description: "Monthly income is required",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 5:
        if (!formData.businessReason) {
          toast({
            title: "Please fill out all fields",
            description: "Business reason is required",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 6:
        if (!formData.investment) {
          toast({
            title: "Please select an option",
            description: "Investment information is required",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 7:
        if (!formData.videosWatched) {
          toast({
            title: "Please select an option",
            description: "Please indicate how many videos you've watched",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 8:
        if (!formData.socialHandle) {
          toast({
            title: "Please fill out all fields",
            description: "Social media handle is required",
            variant: "destructive",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  useEffect(() => {
    setProgress((step / totalSteps) * 100)
  }, [step])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'firstName' && value.trim() !== '') {
      setHasEnteredName(true)
    }
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const nextStep = () => {
    const currentStepIsValid = validateStep(step);
    if (!currentStepIsValid) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (step < totalSteps) {
      if (step === 2) {
        sendPartialData();
      }
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  useEffect(() => {
    const handleGlobalKeyPress = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting) {
        e.preventDefault();
        nextStep();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyPress);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyPress);
    };
}, [isSubmitting, nextStep]);

  useEffect(() => {
    const forceBlackBackground = (element: HTMLInputElement | HTMLTextAreaElement) => {
      element.style.backgroundColor = 'transparent';
      element.style.color = '#eecc6e';
    };

    inputRefs.current.forEach(input => {
      if (input) {
        input.addEventListener('focus', () => forceBlackBackground(input));
        input.addEventListener('blur', () => forceBlackBackground(input));
        input.addEventListener('input', () => forceBlackBackground(input));
      }
    });

    return () => {
      inputRefs.current.forEach(input => {
        if (input) {
          input.removeEventListener('focus', () => forceBlackBackground(input));
          input.removeEventListener('blur', () => forceBlackBackground(input));
          input.removeEventListener('input', () => forceBlackBackground(input));
        }
      });
    };
  }, []);

  const inputClassName = "bg-black text-[#eecc6e] border-b border-[#eecc6e] rounded-none focus:ring-0 focus:outline-none text-xl sm:text-2xl pb-2 font-semibold w-full placeholder-[#eecc6e] placeholder-opacity-50 focus:border-[#eecc6e] focus:border-opacity-100";
  const inputStyle = { 
    borderTop: 'none', 
    borderLeft: 'none', 
    borderRight: 'none', 
    boxShadow: 'none',
    backgroundColor: 'transparent',
    color: '#eecc6e'
  }

  const renderStep = () => {
    const stepContent = (() => {
      switch (step) {
        case 1:
          return (
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">What's your name?</h2>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="First Name"
                    className={inputClassName}
                    style={inputStyle}
                    ref={el => { if (el) inputRefs.current[0] = el; }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Last Name"
                    className={inputClassName}
                    style={inputStyle}
                    ref={el => { if (el) inputRefs.current[1] = el; }}
                  />
                </div>
              </div>
            </div>
          )
        case 2:
          return (
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
                {hasEnteredName ? `Great, ${formData.firstName}! What's your contact information?` : "What's your contact information?"}
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Select defaultValue="+1" onValueChange={(value) => setCountryCode(value)}>
                      <SelectTrigger className="w-[80px] bg-[#eecc6e] text-black hover:bg-[#eecc6e]">
                        <SelectValue placeholder="+1" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#eecc6e] text-black">
                        <SelectItem value="+1" className="hover:bg-[#d9b85f] bg-[#eecc6e] focus:bg-[#eecc6e] data-[highlighted]:bg-[#d9b85f]">+1</SelectItem>
                        {/* Add more country codes here if needed */}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const input = e.target.value.replace(/\D/g, '');
                        const formattedInput = input.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, (_, p1, p2, p3) => {
                          if (p3) return `(${p1}) ${p2}-${p3}`;
                          if (p2) return `(${p1}) ${p2}`;
                          if (p1) return `(${p1}`;
                          return '';
                        });
                        handleInputChange({ ...e, target: { ...e.target, name: 'phone', value: formattedInput } });
                        setShowPhoneError(false); // Hide error while typing
                      }}
                      onBlur={() => setShowPhoneError(true)} // Show error when input loses focus
                      required
                      placeholder="(123) 456-7890"
                      className={`${inputClassName} flex-1`}
                      style={inputStyle}
                      ref={el => { if (el) inputRefs.current[2] = el; }}
                    />
                  </div>
                  {showPhoneError && formData.phone && formData.phone.length !== 14 && (
                    <p className="text-red-500 text-sm">Please enter a valid 10-digit phone number</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      handleInputChange(e);
                      setShowEmailError(false); // Hide error while typing
                    }}
                    onBlur={() => setShowEmailError(true)} // Show error when input loses focus
                    required
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    placeholder="Email Address"
                    className={inputClassName}
                    style={inputStyle}
                    ref={el => { if (el) inputRefs.current[3] = el; }}
                  />
                  {showEmailError && formData.email && !formData.email.includes('@') && (
                    <p className="text-red-500 text-sm">Please enter a valid email address</p>
                  )}
                </div>
              </div>
            </div>
          )
        case 3:
          return (
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
                {hasEnteredName ? `${formData.firstName}, what's your current occupation?` : "What's your current occupation?"}
              </h2>
              <Input
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                required
                placeholder="Your Occupation"
                className={inputClassName}
                style={inputStyle}
                ref={el => { if (el) inputRefs.current[4] = el; }}
              />
            </div>
          )
        case 4:
          return (
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
                {hasEnteredName ? `${formData.firstName}, what's your current monthly income?` : "What's your current monthly income?"}
              </h2>
              <RadioGroup
                onValueChange={(value) => handleRadioChange('monthlyIncome', value)}
                value={formData.monthlyIncome}
                className="space-y-4"
              >
                {['$2,500 - $5,000', '$5,001 - $10,000', '$10,001 - $15,000', '$15,001 - $20,000', '$20,001+'].map((income, index) => (
                  <div key={income} className="flex items-center space-x-3 py-2 hover:bg-[#eecc6e] hover:bg-opacity-10 transition-colors">
                    <RadioGroupItem value={income} id={`income-${index + 1}`} className="border-[#eecc6e] text-[#eecc6e]" />
                    <Label htmlFor={`income-${index + 1}`} className="text-[#eecc6e] text-xl cursor-pointer flex-grow font-semibold">{income}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )
        case 5:
          return (
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
                {hasEnteredName ? `${formData.firstName}, why do you want to have your own Renewable Energy Business?` : "Why do you want to have your own Renewable Energy Business?"}
              </h2>
              <Textarea
                id="businessReason"
                name="businessReason"
                value={formData.businessReason}
                onChange={handleInputChange}
                required={true}
                placeholder="Your answer here..."
                className={`${inputClassName} resize-none overflow-hidden`}
                style={{ 
                  ...inputStyle,
                  minHeight: '1.5em',
                  padding: '0',
                  lineHeight: '1.5',
                  height: 'auto',
                  overflow: 'hidden'
                }}
                ref={(el) => {
                  if (el) {
                    inputRefs.current[5] = el;
                    el.style.height = 'auto';
                    el.style.height = el.scrollHeight + 'px';
                  }
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </div>
          )
        case 6:
          return (
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
                {hasEnteredName ? `${formData.firstName}, do you have at least $25,000 liquid to invest if the opportunity is right?` : "Do you have at least $25,000 liquid to invest if the opportunity is right?"}
              </h2>
              <RadioGroup
                onValueChange={(value) => handleRadioChange('investment', value)}
                value={formData.investment}
                className="space-y-4"
              >
                {['Yes, I do', 'No, I don\'t', 'No, but I have good credit!'].map((option, index) => (
                  <div key={option} className="flex items-center space-x-3 py-2 px-2 hover:bg-[#eecc6e] hover:bg-opacity-10 transition-colors rounded-lg">
                    <RadioGroupItem value={option} id={`investment-${index + 1}`} className="border-[#eecc6e] text-[#eecc6e]" />
                    <Label htmlFor={`investment-${index + 1}`} className="text-[#eecc6e] text-lg sm:text-xl cursor-pointer flex-grow font-semibold">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )
        case 7:
          return (
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
                {hasEnteredName ? `${formData.firstName}, roughly how many videos have you seen from Ivan's YouTube channel?` : "Roughly how many videos have you seen from Ivan's YouTube channel?"}
              </h2>
              <RadioGroup
                onValueChange={(value) => handleRadioChange('videosWatched', value)}
                value={formData.videosWatched}
                className="space-y-4"
              >
                {['1-2', '3-4', '5+'].map((option, index) => (
                  <div key={option} className="flex items-center space-x-3 py-2 hover:bg-[#eecc6e] hover:bg-opacity-10 transition-colors">
                    <RadioGroupItem value={option} id={`videos-${index + 1}`} className="border-[#eecc6e] text-[#eecc6e]" />
                    <Label htmlFor={`videos-${index + 1}`} className="text-[#eecc6e] text-xl cursor-pointer flex-grow font-semibold">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )
        case 8:
          return (
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
                {hasEnteredName ? `${formData.firstName}, what's your Instagram handle? (or Facebook if you don't have Instagram)` : "What's your Instagram handle? (or Facebook if you don't have Instagram)"}
              </h2>
              <Input
                id="socialHandle"
                name="socialHandle"
                value={formData.socialHandle}
                onChange={handleInputChange}
                required
                placeholder="@yourusername"
                className={inputClassName}
                style={inputStyle}
                ref={el => { if (el) inputRefs.current[6] = el; }}
              />
              <p className="text-[#eecc6e] font-semibold mt-8 text-lg">
                {hasEnteredName ? `${formData.firstName}, please note: ` : ""}
                This is NOT a coaching call. This is a call to learn about our 100% Guaranteed Done-for-You Remote Dealer System and how you can create a guaranteed passive income. This is for those ready to learn about what we offer and see if you're a great fit!
              </p>
            </div>
          )
        default:
          return null
      }
    })()

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {stepContent}
        </motion.div>
      </AnimatePresence>
    )
  }

const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Final validation
    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        toast({
          title: "Please fill out all fields",
          description: `${key.charAt(0).toUpperCase() + key.slice(1)} is required`,
          variant: "destructive",
        });
        return;
      }
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true)

    const sanitizedFormData = sanitizeFormData(formData);
    const dataWithUTM = {           // Add this line
      ...sanitizedFormData,         // Add this line
      ...utmData                    // Add this line
    };                              // Add this line

    console.log("Submitting data with UTMs:", dataWithUTM);

    try {
      const response = await fetch('https://hook.us1.make.com/5vgg4fdi9bfygqqnyu2h11c63d8vbw6w', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithUTM),  // Change this line from sanitizedFormData to dataWithUTM
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      
      if (data.redirectUrl) {
        setRedirectUrl(data.redirectUrl)
        setCountdown(3);
      } else {
        toast({
          title: "Form submitted successfully!",
          description: "Thank you for your submission.",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error submitting form",
        description: "Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendPartialData = async () => {
    const partialData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      ...utmData 
    };

    try {
      const response = await fetch('https://hook.us1.make.com/6miax4kfvflw5fh0u9v6nvhmakzsmifk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partialData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      console.log('Partial data sent successfully');
    } catch (error) {
      console.error('Error sending partial data:', error);
    }
  };

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0 && redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, [countdown, redirectUrl]);

  useEffect(() => {
    if (redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [redirectUrl])

useEffect(() => {
  // First try to get UTMs from URL
  const searchParams = new URLSearchParams(window.location.search);
  const utmParams: UTMData = {};
  
  // Listen for messages from parent window
  const handleMessage = (event: MessageEvent) => {
    console.log("Received message:", event.data); // Debug log
    
    if (event.data.type === 'UTM_PARAMS') {
      console.log("Setting UTM params:", event.data.params); // Debug log
      setUtmData(event.data.params);
    }
  };

  window.addEventListener('message', handleMessage);
  
  // Send ready message to parent
  window.parent.postMessage({ type: 'FORM_READY' }, '*');

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, []);

  return (
  <div className="h-screen flex flex-col items-center justify-center bg-black text-[#eecc6e] font-semibold relative px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-radial from-yellow-900/20 to-transparent"></div>
      <motion.div 
        className="w-full max-w-3xl py-6 sm:py-8 md:py-12 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: shake ? [-10, 10, -10, 10, 0] : 0
        }}
        transition={{ 
          duration: 0.5,
          x: { duration: 0.4, ease: "easeInOut" }
        }}
      >
        <div className="flex justify-center mb-4 sm:mb-6">
          <img 
            src="https://framerusercontent.com/images/BDLhPzEOksfdxSL8XGmDLnyxRw.png?scale-down-to=512" 
            alt="Solar Boss Automations"
            className="h-6 sm:h-8 w-auto" 
          />
        </div>
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8 text-center">
          <img 
            src="https://res.cloudinary.com/dmbzcxhjn/image/upload/images__2_-removebg-preview_gwcfez.png" 
            alt="Encryption Icon" 
            className="h-4 sm:h-5 w-auto"
          />
          <span className="text-xs sm:text-sm text-[#eecc6e] opacity-80">
            Your information is securely encrypted and protected.
          </span>
        </div>
        <div className="w-full h-1 bg-gray-800 mb-8 sm:mb-12 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
        {!redirectUrl ? (
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {renderStep()}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center sm:justify-start mt-8 sm:mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
  type="button" 
  onClick={nextStep}
  className="block bg-gradient-to-r from-yellow-400 to-yellow-200 text-black hover:from-yellow-300 hover:to-yellow-100 transition-all duration-300 font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 sm:w-auto min-w-[100px] flex items-center justify-center"
>
  {step < totalSteps ? 'OK' : 'Submit'}
</Button>
              <span className="mt-4 sm:mt-0 sm:ml-4 text-[#eecc6e] text-base sm:text-lg">Press <strong>Enter ↵</strong></span>
            </motion.div>
          </form>
        ) : (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">Don't lose your progress!</h2>
            {countdown !== null && (
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-6xl sm:text-7xl md:text-8xl font-bold text-yellow-400 mb-6 sm:mb-8"
              >
                {countdown}
              </motion.div>
            )}
            <p className="text-xl sm:text-2xl mb-4 text-yellow-100">You will be redirected in {countdown} seconds...</p>
          </motion.div>
        )}
      </motion.div>

      {/* Fixed bottom navigation */}
      {step > 1 && !redirectUrl && (
        <div 
          className="fixed bottom-4 sm:bottom-8 left-0 right-0 flex justify-between px-4 sm:px-8 md:px-16 z-50"
        >
          <Button 
            type="button" 
            onClick={prevStep}
            variant="ghost"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200 text-black hover:bg-yellow-300 transition-colors font-semibold flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </Button>
          <Button 
            type="button" 
            onClick={nextStep}
            variant="ghost"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200 text-black hover:bg-yellow-300 transition-colors font-semibold flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Button>
        </div>
      )}
    </div>
  )
}
