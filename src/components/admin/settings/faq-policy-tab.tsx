"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FaqItem } from "./types";

interface FaqPolicyTabProps {
  faqEnabled: boolean;
  setFaqEnabled: (val: boolean) => void;
  faqItems: FaqItem[];
  onAddFaqItem: () => void;
  onUpdateFaqItem: (id: string, field: "question" | "answer", val: string) => void;
  onRemoveFaqItem: (id: string) => void;
  returnPolicyEnabled: boolean;
  setReturnPolicyEnabled: (val: boolean) => void;
  returnPolicyText: string;
  setReturnPolicyText: (val: string) => void;
}

export function FaqPolicyTab({
  faqEnabled,
  setFaqEnabled,
  faqItems,
  onAddFaqItem,
  onUpdateFaqItem,
  onRemoveFaqItem,
  returnPolicyEnabled,
  setReturnPolicyEnabled,
  returnPolicyText,
  setReturnPolicyText,
}: FaqPolicyTabProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-6">
      <h3 className="font-heading font-extrabold italic text-lg text-plum uppercase pb-2 border-b border-border">
        Frequently Asked Questions &amp; Store Policies
      </h3>

      <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-plum">
        <input
          type="checkbox"
          checked={faqEnabled}
          onChange={(e) => setFaqEnabled(e.target.checked)}
          className="w-5 h-5 rounded text-plum cursor-pointer"
        />
        <span>Enable FAQ Section on Storefront</span>
      </label>

      {/* FAQ List */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-plum">FAQ Items ({faqItems.length})</span>
          <Button type="button" size="sm" variant="outline" onClick={onAddFaqItem} className="h-8 text-xs font-semibold cursor-pointer">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Question
          </Button>
        </div>

        {faqItems.map((item, index) => (
          <div key={item.id} className="p-4 rounded-xl bg-ivory border border-border space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-pink uppercase">Question #{index + 1}</span>
              <button
                type="button"
                onClick={() => onRemoveFaqItem(item.id)}
                className="text-plum-muted hover:text-destructive p-1 rounded cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <Input
              placeholder="Question title..."
              value={item.question}
              onChange={(e) => onUpdateFaqItem(item.id, "question", e.target.value)}
              className="h-10 text-xs font-semibold bg-white"
            />
            <Textarea
              placeholder="Detailed answer..."
              value={item.answer}
              onChange={(e) => onUpdateFaqItem(item.id, "answer", e.target.value)}
              className="min-h-16 text-xs bg-white resize-none"
            />
          </div>
        ))}
      </div>

      {/* Return Policy */}
      <div className="pt-4 border-t border-border space-y-3">
        <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-plum">
          <input
            type="checkbox"
            checked={returnPolicyEnabled}
            onChange={(e) => setReturnPolicyEnabled(e.target.checked)}
            className="w-5 h-5 rounded text-plum cursor-pointer"
          />
          <span>Enable Store Policy Page</span>
        </label>

        {returnPolicyEnabled && (
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-bold uppercase text-plum">Policy Text (English)</Label>
            <Textarea
              placeholder="Officially confirmed terms for returns, damaged parcels, or cancellations..."
              value={returnPolicyText}
              onChange={(e) => setReturnPolicyText(e.target.value)}
              className="min-h-24 rounded-xl text-xs"
            />
            <p className="text-[11px] text-plum-muted">
              Displayed on `/policies` or checkout footer only when enabled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
