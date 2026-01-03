import { trustedCompanies } from '@/data/mockData';

export function TrustedCompanies() {
  return (
    <section className="py-12 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-muted-foreground font-medium mb-8">
          Được tin tưởng bởi hơn 15.000 doanh nghiệp và hàng triệu học viên trên toàn thế giới
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {trustedCompanies.map((company) => (
            <div
              key={company.name}
              className="flex items-center gap-2 text-muted-foreground opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="text-3xl">{company.logo}</span>
              <span className="font-semibold text-lg hidden sm:block">{company.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
