"use client";

import { SearchForm } from "@/src/components/search/SearchForm";
import { ResultsSection } from "@/src/components/results/ResultsSection";
import { Plane } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Plane className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Flight Search
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Find and compare the best flights for your next trip
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Where are you flying?
          </h2>
          <SearchForm />
        </section>

        {/* Results Section */}
        <section>
          <ResultsSection />
        </section>
      </main>
    </div>
  );
}
