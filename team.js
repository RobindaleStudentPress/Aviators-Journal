const teamGroups = [
    {
        title: "Editorial Leadership",
        description: "The team responsible for guiding the newspaper and its editorial vision.",
        members: [
            { name: "Martha Valverde", role: "Editor-in-Chief" },
            { name: "Amanda Partida", role: "Faculty Advisor" }
        ]
    },
    {
        title: "Column Editors",
        description: "Each section brings a different perspective to student life.",
        members: [
            { name: "Dixon Manalo", role: "Media Editor" },
            { name: "Sofia Pena", role: "School Events Editor" },
            { name: "Megan Ward", role: "Sports Editor" },
            { name: "Miranda Alfaro", role: "Real-World Editor" }
        ]
    },
    {
        title: "Photography Team",
        description: "Capturing the moments and people that make our school community.",
        members: [
            { name: "Ilda Hernandez", role: "Video Editor" },
            { name: "Oscar Trevino", role: "Staff Photographer" },
            { name: "Chantal Ruiz", role: "Staff Photographer" },
            { name: "Sandra Solis", role: "Staff Photographer" },
            { name: "Saori Rodriguez", role: "Staff Photographer" },
            { name: "Valeria Salazar", role: "Staff Photographer" },
            { name: "Sophie Gonzales", role: "Staff Photographer" },
            { name: "Paola Teran", role: "Staff Photographer" }
        ]
    },
    {
        title: "Writers & Contributors",
        description: "The voices behind our reporting, features, and stories.",
        members: [
            { name: "[Add Name]", role: "Staff Writer" },
            { name: "[Add Name]", role: "Staff Writer" },
            { name: "[Add Name]", role: "Student Contributor" },
            { name: "[Add Name]", role: "Student Contributor" },
            { name: "[Add Name]", role: "Student Contributor" },
            { name: "[Add Name]", role: "Student Contributor" }
        ]
    }
];

function renderTeam() {
    const container = document.getElementById("team-content");
    if (!container) return;

    container.innerHTML = teamGroups.map(group => `
        <section class="team-group">
            <h2>${group.title}</h2>
            <p class="team-description">${group.description}</p>
            <div class="team-list">
                ${group.members.map(member => `
                    <div class="team-member">
                        <span class="member-name">${member.name}</span>
                        <span class="member-role">${member.role}</span>
                    </div>
                `).join("")}
            </div>
        </section>
    `).join("");
}

renderTeam();
