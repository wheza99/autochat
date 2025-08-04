import { ArrowRight } from "lucide-react";

const departments = [
  {
    title: "Sales",
    roles: [
      {
        id: "role-1",
        title: "Sales Manager",
        location: "London",
        href: "#",
      },
      {
        id: "role-2",
        title: "Sales Development Representative",
        location: "London",
        href: "#",
      },
      {
        id: "role-3",
        title: "Sales Manager",
        location: "London",
        href: "#",
      },
    ],
  },
  {
    title: "Customer Success",
    roles: [
      {
        id: "role-4",
        title: "Customer Success Associate",
        location: "London",
        href: "#",
      },
    ],
  },
];

const Careers1 = () => {
  return (
    <section className="bg-background py-32">
      <div className="container">
        <h2 className="text-4xl font-medium md:text-6xl">Careers</h2>
        <p className="mt-6 whitespace-pre-wrap text-muted-foreground md:mb-20 md:text-lg">
          View our open roles.
        </p>
        {departments.map((department) => (
          <div key={department.title} className="mt-12 md:mt-20">
            <h3 className="mb-8 text-3xl font-medium md:text-4xl">
              {department.title}
            </h3>
            <ul className="divide-y divide-border border-y border-border">
              {department.roles.map((role) => (
                <li key={role.id} className="group">
                  <a href={role.href} className="flex items-center py-6">
                    <div>
                      <div className="font-medium md:text-lg">{role.title}</div>
                      <div className="text-xs text-muted-foreground md:mt-2 md:text-sm">
                        {role.location}
                      </div>
                    </div>
                    <ArrowRight className="ml-auto size-6 -translate-x-6 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export { Careers1 };
