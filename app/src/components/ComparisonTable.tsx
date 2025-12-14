'use client';

type Rating = 'excellent' | 'good' | 'fair' | 'poor';

interface ComparisonData {
  [criterion: string]: {
    [item: string]: string | Rating;
  };
}

interface ComparisonTableProps {
  items: string[];
  criteria: string[];
  data: ComparisonData;
  title?: string;
}

// 評価マーク
const ratingMarks: Record<Rating, { symbol: string; color: string }> = {
  excellent: { symbol: '◎', color: 'text-green-600' },
  good: { symbol: '○', color: 'text-blue-600' },
  fair: { symbol: '△', color: 'text-yellow-600' },
  poor: { symbol: '×', color: 'text-red-600' },
};

function isRating(value: string): value is Rating {
  return ['excellent', 'good', 'fair', 'poor'].includes(value);
}

function CellContent({ value }: { value: string | Rating }) {
  if (isRating(value)) {
    const { symbol, color } = ratingMarks[value];
    return <span className={`text-lg font-bold ${color}`}>{symbol}</span>;
  }
  return <span>{value}</span>;
}

export function ComparisonTable({
  items,
  criteria,
  data,
  title,
}: ComparisonTableProps) {
  return (
    <div className="my-6">
      {title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-3">{title}</h4>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-300">
                比較項目
              </th>
              {items.map((item) => (
                <th
                  key={item}
                  className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border border-gray-300"
                >
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion) => (
              <tr key={criterion} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 bg-gray-50">
                  {criterion}
                </td>
                {items.map((item) => (
                  <td
                    key={`${criterion}-${item}`}
                    className="px-4 py-3 text-sm text-gray-700 border border-gray-300 text-center"
                  >
                    <CellContent value={data[criterion]?.[item] || '-'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-gray-500">
        <span>
          <span className="text-green-600 font-bold">◎</span> 優れている
        </span>
        <span>
          <span className="text-blue-600 font-bold">○</span> 良い
        </span>
        <span>
          <span className="text-yellow-600 font-bold">△</span> やや劣る
        </span>
        <span>
          <span className="text-red-600 font-bold">×</span> 劣る
        </span>
      </div>
    </div>
  );
}

// シンプルな比較表（2つの項目を比較）
interface SimpleComparisonProps {
  itemA: string;
  itemB: string;
  comparisons: Array<{
    aspect: string;
    a: string;
    b: string;
  }>;
  title?: string;
}

export function SimpleComparison({
  itemA,
  itemB,
  comparisons,
  title,
}: SimpleComparisonProps) {
  return (
    <div className="my-6">
      {title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-3">{title}</h4>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-300">
                比較項目
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-blue-700 border border-gray-300 bg-blue-50">
                {itemA}
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-green-700 border border-gray-300 bg-green-50">
                {itemB}
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map(({ aspect, a, b }) => (
              <tr key={aspect} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 bg-gray-50">
                  {aspect}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300 text-center">
                  {a}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300 text-center">
                  {b}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
