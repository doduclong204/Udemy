import { trustedCompanies } from '@/data/mockData';

export function TrustedCompanies() {
  return (
    <section className="py-10 bg-secondary border border-border rounded-2xl my-8">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-foreground font-medium mb-8">
          Được tin tưởng bởi hơn 15.000 doanh nghiệp và hàng triệu học viên trên toàn thế giới
        </h2>
        <div className="flex justify-between items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {trustedCompanies.map((company) => (
            <div
              key={company.name}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors flex-shrink-0"
            >
              <span className="text-3xl">{company.logo}</span>
              <span className="font-semibold text-lg whitespace-nowrap">{company.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}