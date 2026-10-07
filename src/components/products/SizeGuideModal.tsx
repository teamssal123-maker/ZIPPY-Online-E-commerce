import React, { useState } from 'react';
import { X, Ruler, HelpCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useShop();
  const [activeTab, setActiveTab] = useState<'blazer' | 'shirt' | 'panjabi' | 'pant'>('blazer');
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isSizeGuideOpen) return null;

  const data = {
    blazer: {
      headers: ['Size', 'Chest (Inches)', 'Shoulder', 'Jacket Length', 'Sleeve Length'],
      headersCm: ['Size', 'Chest (cm)', 'Shoulder (cm)', 'Jacket Length (cm)', 'Sleeve Length (cm)'],
      rowsInches: [
        ['S (38)', '38 - 39"', '17.5"', '29.0"', '25.0"'],
        ['M (40)', '40 - 41"', '18.0"', '29.5"', '25.5"'],
        ['L (42)', '42 - 43"', '18.5"', '30.0"', '26.0"'],
        ['XL (44)', '44 - 45"', '19.0"', '30.5"', '26.5"'],
        ['XXL (46)', '46 - 47"', '19.5"', '31.0"', '27.0"']
      ],
      rowsCm: [
        ['S (38)', '96 - 99 cm', '44.5 cm', '73.5 cm', '63.5 cm'],
        ['M (40)', '101 - 104 cm', '45.7 cm', '75.0 cm', '64.8 cm'],
        ['L (42)', '106 - 109 cm', '47.0 cm', '76.2 cm', '66.0 cm'],
        ['XL (44)', '111 - 114 cm', '48.2 cm', '77.5 cm', '67.3 cm'],
        ['XXL (46)', '116 - 119 cm', '49.5 cm', '78.7 cm', '68.5 cm']
      ]
    },
    shirt: {
      headers: ['Collar Size', 'Chest (Inches)', 'Waist', 'Shirt Length', 'Sleeve'],
      headersCm: ['Collar Size', 'Chest (cm)', 'Waist (cm)', 'Shirt Length (cm)', 'Sleeve (cm)'],
      rowsInches: [
        ['S (15.0")', '39.0"', '36.0"', '29.5"', '33.0"'],
        ['M (15.5")', '41.0"', '38.0"', '30.0"', '33.5"'],
        ['L (16.0")', '43.0"', '40.0"', '30.5"', '34.0"'],
        ['XL (16.5")', '45.0"', '42.5"', '31.0"', '34.5"'],
        ['XXL (17.0")', '47.5"', '45.0"', '31.5"', '35.0"']
      ],
      rowsCm: [
        ['S (38 cm)', '99.0 cm', '91.5 cm', '75.0 cm', '83.8 cm'],
        ['M (39 cm)', '104.0 cm', '96.5 cm', '76.2 cm', '85.0 cm'],
        ['L (41 cm)', '109.0 cm', '101.6 cm', '77.5 cm', '86.4 cm'],
        ['XL (42 cm)', '114.3 cm', '108.0 cm', '78.7 cm', '87.6 cm'],
        ['XXL (43 cm)', '120.6 cm', '114.3 cm', '80.0 cm', '88.9 cm']
      ]
    },
    panjabi: {
      headers: ['Size', 'Chest', 'Length', 'Sleeve Length', 'Collar'],
      headersCm: ['Size', 'Chest (cm)', 'Length (cm)', 'Sleeve Length (cm)', 'Collar (cm)'],
      rowsInches: [
        ['38 (S)', '40.0"', '40.0"', '24.5"', '15.0"'],
        ['40 (M)', '42.0"', '42.0"', '25.0"', '15.5"'],
        ['42 (L)', '44.0"', '44.0"', '25.5"', '16.0"'],
        ['44 (XL)', '46.0"', '45.0"', '26.0"', '16.5"'],
        ['46 (XXL)', '48.0"', '46.0"', '26.5"', '17.0"']
      ],
      rowsCm: [
        ['38 (S)', '101.6 cm', '101.6 cm', '62.2 cm', '38.0 cm'],
        ['40 (M)', '106.7 cm', '106.7 cm', '63.5 cm', '39.4 cm'],
        ['42 (L)', '111.8 cm', '111.8 cm', '64.8 cm', '40.6 cm'],
        ['44 (XL)', '116.8 cm', '114.3 cm', '66.0 cm', '41.9 cm'],
        ['46 (XXL)', '121.9 cm', '116.8 cm', '67.3 cm', '43.2 cm']
      ]
    },
    pant: {
      headers: ['Waist Size', 'Hip', 'Thigh', 'Inseam Length', 'Leg Opening'],
      headersCm: ['Waist Size', 'Hip (cm)', 'Thigh (cm)', 'Inseam (cm)', 'Leg Opening (cm)'],
      rowsInches: [
        ['30', '38.0"', '23.0"', '31.5"', '14.0"'],
        ['32', '40.0"', '24.0"', '32.0"', '14.5"'],
        ['34', '42.0"', '25.0"', '32.5"', '15.0"'],
        ['36', '44.0"', '26.0"', '33.0"', '15.5"'],
        ['38', '46.0"', '27.0"', '33.0"', '16.0"']
      ],
      rowsCm: [
        ['30', '96.5 cm', '58.4 cm', '80.0 cm', '35.5 cm'],
        ['32', '101.6 cm', '61.0 cm', '81.3 cm', '36.8 cm'],
        ['34', '106.7 cm', '63.5 cm', '82.5 cm', '38.0 cm'],
        ['36', '111.8 cm', '66.0 cm', '83.8 cm', '39.4 cm'],
        ['38', '116.8 cm', '68.5 cm', '83.8 cm', '40.6 cm']
      ]
    }
  };

  const currentTab = data[activeTab];
  const headers = unit === 'inches' ? currentTab.headers : currentTab.headersCm;
  const rows = unit === 'inches' ? currentTab.rowsInches : currentTab.rowsCm;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white shadow-2xl border border-neutral-200 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#9A7B38]" />
            <h3 className="font-serif text-xl font-bold text-neutral-900">
              Zippy Master Sizing Matrix
            </h3>
          </div>
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="p-1 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex items-center justify-between mt-6 pb-2 border-b border-neutral-200">
          <div className="flex gap-2">
            {(['blazer', 'shirt', 'panjabi', 'pant'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1">
            <button
              onClick={() => setUnit('inches')}
              className={`px-2 py-0.5 text-[11px] font-bold ${
                unit === 'inches' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
              }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-2 py-0.5 text-[11px] font-bold ${
                unit === 'cm' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                {headers.map((h, i) => (
                  <th key={i} className="py-3 px-3 font-bold text-neutral-900 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-neutral-50/60 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`py-3 px-3 tabular-nums ${
                        cIdx === 0 ? 'font-bold text-neutral-900' : 'text-neutral-600'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Measuring Tip */}
        <div className="mt-6 p-4 bg-[#F9F9F8] border border-neutral-200 text-xs text-neutral-600 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-neutral-900">Measuring Guidance:</strong> Chest measurement
            should be taken around the fullest part of your chest, keeping the tape level under your
            arms. For between-sizes, we recommend ordering one size up for tailored comfort.
            Bespoke alteration available at our Gulshan Atelier.
          </p>
        </div>
      </div>
    </div>
  );
};
