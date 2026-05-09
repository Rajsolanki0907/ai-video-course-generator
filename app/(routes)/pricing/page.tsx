import { PricingTable } from '@clerk/nextjs'
import React from 'react'
import { ShieldCheck, Zap, CreditCard } from 'lucide-react'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-20 px-4 relative overflow-hidden">
      {/* Background blobs for aesthetics */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-40 -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-40 -z-10" />

      <div className="max-w-4xl mx-auto text-center mb-16 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
          <Zap size={14} className="fill-current" />
          <span>Flexible Plans</span>
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl mb-6">
          Choose the Perfect <span className="text-blue-600">Plan</span>
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Unlock your potential with personalized AI-driven video courses. 
          Pick a plan that fits your learning pace and goals.
        </p>
      </div>

      <div className="max-w-5xl mx-auto relative group">
        {/* The Pricing Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-2xl shadow-blue-900/5 p-4 sm:p-10 md:p-14 border border-white/20">
          <PricingTable />
        </div>
      </div>

      {/* Features Footer */}
      <div className="mt-24 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center border-t border-slate-200 pt-16">
         <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Secure Payments</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Industry standard encryption for all your transactions.</p>
         </div>
         <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Instant Access</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Upgrade and start creating your AI courses immediately.</p>
         </div>
         <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 mb-4">
              <CreditCard size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Cancel Anytime</h3>
            <p className="text-sm text-slate-500 leading-relaxed">No long-term commitments. Cancel your subscription with one click.</p>
         </div>
      </div>
    </div>
  )
}
