import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { User, UserRole, UserStatus } from "./modules/users/user.entity";
import { Category } from "./modules/categories/category.entity";
import { Thread, ThreadStatus } from "./modules/threads/thread.entity";
import { Post } from "./modules/posts/post.entity";
import { Reaction, ReactionType } from "./modules/reactions/reaction.entity";
import { Badge } from "./modules/reputation/badge.entity";

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await dataSource.query("TRUNCATE TABLE reactions CASCADE");
    await dataSource.query("TRUNCATE TABLE posts CASCADE");
    await dataSource.query("TRUNCATE TABLE threads CASCADE");
    await dataSource.query("TRUNCATE TABLE categories CASCADE");
    await dataSource.query("TRUNCATE TABLE user_badges CASCADE");
    await dataSource.query("TRUNCATE TABLE user_bookmarks CASCADE");
    await dataSource.query("TRUNCATE TABLE user_followers CASCADE");
    await dataSource.query("TRUNCATE TABLE user_following CASCADE");
    await dataSource.query("TRUNCATE TABLE badges CASCADE");
    await dataSource.query("TRUNCATE TABLE users CASCADE");
    console.log("✅ Data cleared\n");

    const userRepository = dataSource.getRepository(User);
    const categoryRepository = dataSource.getRepository(Category);
    const threadRepository = dataSource.getRepository(Thread);
    const postRepository = dataSource.getRepository(Post);
    const reactionRepository = dataSource.getRepository(Reaction);
    const badgeRepository = dataSource.getRepository(Badge);

    // Create Badges
    console.log("Creating badges...");
    const badges = await badgeRepository.save([
      {
        name: "New Mom",
        description: "Welcome to the community!",
        icon: "baby",
        color: "#FFB6C1",
        requirement: "Join the forum",
        points: 10,
      },
      {
        name: "Helpful Helper",
        description: "Received 10 helpful reactions",
        icon: "users",
        color: "#87CEEB",
        requirement: "10 helpful reactions",
        points: 50,
      },
      {
        name: "Super Mom",
        description: "Created 50 posts",
        icon: "star",
        color: "#FFD700",
        requirement: "50 posts",
        points: 100,
      },
      {
        name: "Sleep Expert",
        description: "Contributed valuable sleep advice",
        icon: "moon",
        color: "#9370DB",
        requirement: "Expert in sleep topics",
        points: 75,
      },
      {
        name: "Nutrition Guru",
        description: "Expert in baby nutrition and feeding",
        icon: "apple",
        color: "#98FB98",
        requirement: "Expert in nutrition topics",
        points: 75,
      },
    ]);
    console.log(`✅ Created ${badges.length} badges\n`);

    // Create Users
    console.log("👥 Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const users = await userRepository.save([
      {
        username: "admin",
        email: "admin@forum.com",
        password: hashedPassword,
        fullName: "Admin User",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        bio: "Forum administrator",
        reputation: 1000,
        postCount: 50,
        threadCount: 10,
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      {
        username: "moderator_sarah",
        email: "sarah@forum.com",
        password: hashedPassword,
        fullName: "Sarah Johnson",
        role: UserRole.MODERATOR,
        status: UserStatus.ACTIVE,
        bio: "Mom of 2, moderator, pediatric nurse with 10 years experience",
        location: "London, UK",
        reputation: 750,
        postCount: 320,
        threadCount: 45,
        avatar: "https://i.pravatar.cc/150?img=5",
        dueDate: null,
        birthDate: new Date("2020-03-15"),
      },
      {
        username: "emma_mom",
        email: "emma@example.com",
        password: hashedPassword,
        fullName: "Emma Thompson",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        bio: "First time mom, expecting in April 2026!",
        location: "Manchester, UK",
        reputation: 245,
        postCount: 85,
        threadCount: 12,
        avatar: "https://i.pravatar.cc/150?img=9",
        dueDate: new Date("2026-04-15"),
      },
      {
        username: "olivia_twins",
        email: "olivia@example.com",
        password: hashedPassword,
        fullName: "Olivia Martinez",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        bio: "Mom of twin boys, age 6 months. Always happy to share tips!",
        location: "Birmingham, UK",
        reputation: 520,
        postCount: 156,
        threadCount: 23,
        avatar: "https://i.pravatar.cc/150?img=10",
        birthDate: new Date("2025-05-10"),
      },
      {
        username: "sophia_experienced",
        email: "sophia@example.com",
        password: hashedPassword,
        fullName: "Sophia Williams",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        bio: "Mother of 3 (ages 8, 5, and 2). Love helping new moms!",
        location: "Leeds, UK",
        reputation: 890,
        postCount: 420,
        threadCount: 67,
        avatar: "https://i.pravatar.cc/150?img=24",
      },
      {
        username: "ava_newmom",
        email: "ava@example.com",
        password: hashedPassword,
        fullName: "Ava Chen",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        bio: "Just had my baby girl 3 weeks ago! Learning so much here.",
        location: "Bristol, UK",
        reputation: 125,
        postCount: 42,
        threadCount: 8,
        avatar: "https://i.pravatar.cc/150?img=27",
        birthDate: new Date("2025-10-25"),
      },
      {
        username: "isabella_nutritionist",
        email: "isabella@example.com",
        password: hashedPassword,
        fullName: "Isabella Rodriguez",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        bio: "Certified nutritionist and mom. Passionate about healthy eating for babies.",
        location: "Edinburgh, UK",
        reputation: 645,
        postCount: 198,
        threadCount: 31,
        avatar: "https://i.pravatar.cc/150?img=31",
        birthDate: new Date("2024-08-20"),
      },
      {
        username: "mia_sleepcoach",
        email: "mia@example.com",
        password: hashedPassword,
        fullName: "Mia Anderson",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        bio: "Sleep consultant and mom of 2. Happy to help with sleep issues!",
        location: "Glasgow, UK",
        reputation: 710,
        postCount: 245,
        threadCount: 38,
        avatar: "https://i.pravatar.cc/150?img=32",
        birthDate: new Date("2023-12-10"),
      },
      {
        username: "charlotte_expecting",
        email: "charlotte@example.com",
        password: hashedPassword,
        fullName: "Charlotte Brown",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        bio: "35 weeks pregnant with my first! So excited and nervous.",
        location: "Liverpool, UK",
        reputation: 180,
        postCount: 67,
        threadCount: 15,
        avatar: "https://i.pravatar.cc/150?img=35",
        dueDate: new Date("2025-12-05"),
      },
      {
        username: "amelia_workingmom",
        email: "amelia@example.com",
        password: hashedPassword,
        fullName: "Amelia Wilson",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        bio: "Working mom trying to balance career and motherhood. Baby is 14 months.",
        location: "Nottingham, UK",
        reputation: 385,
        postCount: 134,
        threadCount: 19,
        avatar: "https://i.pravatar.cc/150?img=38",
        birthDate: new Date("2024-09-15"),
      },
    ]);
    console.log(`✅ Created ${users.length} users\n`);

    // Assign badges to users
    users[1].badges = [badges[0], badges[1], badges[3]]; // Moderator Sarah
    users[4].badges = [badges[0], badges[2]]; // Sophia
    users[6].badges = [badges[0], badges[4]]; // Isabella (nutritionist)
    users[7].badges = [badges[0], badges[3]]; // Mia (sleep coach)
    await userRepository.save([users[1], users[4], users[6], users[7]]);

    // Create Categories
    console.log("Creating categories...");
    const categories = await categoryRepository.save([
      {
        name: "Pregnancy",
        slug: "pregnancy",
        description: "Everything about pregnancy, from conception to birth",
        icon: "heart",
        color: "#FFB6C1",
        order: 1,
        threadCount: 0,
        postCount: 0,
      },
      {
        name: "Birth Stories",
        slug: "birth-stories",
        description: "Share your birth experiences and stories",
        icon: "baby",
        color: "#FFD700",
        order: 2,
        threadCount: 0,
        postCount: 0,
      },
      {
        name: "Newborn Care",
        slug: "newborn-care",
        description: "Tips and advice for caring for newborns (0-3 months)",
        icon: "baby",
        color: "#87CEEB",
        order: 3,
        threadCount: 0,
        postCount: 0,
      },
      {
        name: "Sleep & Routines",
        slug: "sleep-routines",
        description: "Sleep training, routines, and getting better rest",
        icon: "moon",
        color: "#9370DB",
        order: 4,
        threadCount: 0,
        postCount: 0,
      },
      {
        name: "Feeding & Nutrition",
        slug: "feeding-nutrition",
        description: "Breastfeeding, formula, weaning, and nutrition",
        icon: "utensils",
        color: "#98FB98",
        order: 5,
        threadCount: 0,
        postCount: 0,
      },
      {
        name: "Development & Milestones",
        slug: "development-milestones",
        description: "Baby development, milestones, and growth",
        icon: "trending-up",
        color: "#FFA07A",
        order: 6,
        threadCount: 0,
        postCount: 0,
      },
      {
        name: "Health & Medical",
        slug: "health-medical",
        description: "Health concerns, medical questions, and pediatric advice",
        icon: "heart-pulse",
        color: "#FF6B6B",
        order: 7,
        threadCount: 0,
        postCount: 0,
      },
      {
        name: "Parenting & Lifestyle",
        slug: "parenting-lifestyle",
        description: "Work-life balance, relationships, and parenting tips",
        icon: "users",
        color: "#DDA0DD",
        order: 8,
        threadCount: 0,
        postCount: 0,
      },
      {
        name: "Products & Reviews",
        slug: "products-reviews",
        description: "Baby products, gear reviews, and recommendations",
        icon: "shopping-bag",
        color: "#F0E68C",
        order: 9,
        threadCount: 0,
        postCount: 0,
      },
      {
        name: "Support & Community",
        slug: "support-community",
        description: "Emotional support, making friends, and community",
        icon: "heart",
        color: "#FFB6E1",
        order: 10,
        threadCount: 0,
        postCount: 0,
      },
    ]);
    console.log(`✅ Created ${categories.length} categories\n`);

    // Create Threads and Posts
    console.log("💬 Creating threads and posts...");

    const threadsData = [
      // Pregnancy Category
      {
        category: categories[0],
        author: users[2], // emma_mom
        title: "First trimester symptoms - is this normal?",
        slug: "first-trimester-symptoms-normal",
        content:
          "Hi everyone! I'm 8 weeks pregnant with my first baby and experiencing some pretty intense morning sickness. It's actually all-day sickness for me! I'm also extremely tired and can barely stay awake past 7pm. Is this normal? When does it get better? Would love to hear your experiences! 💚",
        tags: ["first-trimester", "morning-sickness", "symptoms"],
        isPinned: false,
        viewCount: 156,
        posts: [
          {
            author: users[1],
            content:
              "Congratulations on your pregnancy! Yes, this is completely normal. The first trimester can be really tough with the hormones adjusting. Morning sickness typically peaks around 9-10 weeks and often improves by 12-14 weeks. Stay hydrated, eat small frequent meals, and rest when you can. If you can't keep anything down for 24 hours, contact your midwife. Hang in there! 💕",
          },
          {
            author: users[4],
            content:
              "I remember this so well! With all three of my pregnancies, the exhaustion was unreal in the first trimester. I found that ginger tea and crackers helped with the nausea. The good news is it does get better - I felt so much more energetic in the second trimester!",
          },
          {
            author: users[8],
            content:
              "I'm 10 weeks and going through the same thing! It's reassuring to know I'm not alone. I've found that eating before I even get out of bed helps a bit.",
          },
        ],
      },
      {
        category: categories[0],
        author: users[8], // charlotte_expecting
        title: "Third trimester insomnia - help!",
        slug: "third-trimester-insomnia-help",
        content:
          "I'm 35 weeks and I just can't sleep anymore! Between the baby kicking, needing to pee every hour, and just being so uncomfortable, I'm lucky if I get 3-4 hours a night. Any tips from moms who've been through this? I'm exhausted! 😴",
        tags: ["third-trimester", "sleep", "insomnia"],
        isPinned: false,
        viewCount: 98,
        posts: [
          {
            author: users[7],
            content:
              "Oh I feel your pain! At 35 weeks, I was the same. Try a pregnancy pillow if you haven't already - the U-shaped ones are amazing. Also, limit fluids after 6pm if possible. I know it's hard, but try to rest during the day when you can. This too shall pass! 💜",
          },
          {
            author: users[4],
            content:
              "The last few weeks are so hard! I found listening to calm meditation music helped me relax even if I couldn't sleep. And don't feel guilty about napping during the day!",
          },
        ],
      },
      // Birth Stories
      {
        category: categories[1],
        author: users[5], // ava_newmom
        title: "My positive birth story - baby girl arrived!",
        slug: "positive-birth-story-baby-girl",
        content:
          "I wanted to share my birth story while it's still fresh! After 14 hours of labor, my beautiful baby girl arrived weighing 7lbs 3oz. It was challenging but the midwives were amazing and so supportive. The moment they placed her on my chest made everything worth it. I'm so in love! 💗\n\nFor anyone anxious about birth - trust your body, advocate for yourself, and remember that every contraction brings you closer to meeting your baby!",
        tags: ["birth-story", "positive", "natural-birth"],
        isPinned: false,
        isFeatured: true,
        viewCount: 234,
        posts: [
          {
            author: users[2],
            content:
              "Congratulations! This is so beautiful and encouraging to read as a first-time mom-to-be. Thank you for sharing! 💕",
          },
          {
            author: users[1],
            content:
              "Welcome to the world little one! Congratulations mama, you did amazingly! Wishing you a smooth recovery 💗",
          },
          {
            author: users[8],
            content:
              "This gives me so much hope! I'm due in 5 weeks and getting nervous. Congratulations on your beautiful baby girl! 👶",
          },
        ],
      },
      // Newborn Care
      {
        category: categories[2],
        author: users[5], // ava_newmom
        title: "Umbilical cord care - when did yours fall off?",
        slug: "umbilical-cord-care-fall-off",
        content:
          "My baby is 3 weeks old and the umbilical cord stump is still attached. I've been keeping it dry and clean as advised. Is this normal? When did your baby's fall off? Should I be worried?",
        tags: ["newborn", "umbilical-cord", "newborn-care"],
        isPinned: false,
        viewCount: 87,
        posts: [
          {
            author: users[1],
            content:
              "Completely normal! It can take anywhere from 1-3 weeks, sometimes even 4 weeks. As long as there's no redness, swelling, or discharge, you're fine. Just keep it clean and dry. It will fall off when it's ready! 😊",
          },
          {
            author: users[3],
            content:
              "One of my twins took nearly 4 weeks! The other was 10 days. Every baby is different. Don't worry!",
          },
        ],
      },
      {
        category: categories[2],
        author: users[9], // amelia_workingmom
        title: "Is it normal for newborns to cluster feed?",
        slug: "newborn-cluster-feeding-normal",
        content:
          "My 2-week-old seems to want to feed constantly in the evenings, like every 30-45 minutes for hours! Is this normal? I'm exclusively breastfeeding and worried my supply isn't enough. She seems satisfied during the day with 2-3 hour gaps.",
        tags: ["newborn", "breastfeeding", "cluster-feeding"],
        isPinned: true,
        viewCount: 312,
        posts: [
          {
            author: users[1],
            content:
              "Yes! This is called cluster feeding and it's completely normal, especially in the evenings. Babies do this to boost your supply and for comfort. It doesn't mean you don't have enough milk. It's actually helping establish your supply. I know it's exhausting - stay hydrated, eat well, and ask for help with everything else! You're doing great! 🍼",
          },
          {
            author: users[6],
            content:
              "Totally normal! Both my babies did this. The evenings were intense but it does pass. Usually peaks around 2-3 weeks and 6 weeks. Hang in there!",
          },
          {
            author: users[4],
            content:
              "All three of mine were cluster feeders! It's nature's way of boosting your supply. Netflix and snacks became my evening routine 😄",
          },
        ],
      },
      // Sleep & Routines
      {
        category: categories[3],
        author: users[3], // olivia_twins
        title: "Twin sleep schedules - how do I sync them?",
        slug: "twin-sleep-schedules-sync",
        content:
          "My 6-month-old twin boys have completely different sleep schedules and it's killing me! One wakes up just as the other falls asleep. I'm running on empty. How did other twin parents handle this? Any tips for getting them on the same schedule?",
        tags: ["twins", "sleep-schedule", "sleep-training"],
        isPinned: false,
        viewCount: 145,
        posts: [
          {
            author: users[7],
            content:
              "Twin mom here too! The game changer for me was waking them both at the same time for feeds, even if one was sleeping. I know it feels wrong to wake a sleeping baby, but it helped sync them up within about a week. Also, same bedtime routine for both at the same time. You've got this! 💪",
          },
          {
            author: users[4],
            content:
              "Not twins, but I had my kids close together and did the same - wake them together, feed together, sleep together. It takes some time but it works!",
          },
        ],
      },
      {
        category: categories[3],
        author: users[9], // amelia_workingmom
        title: "4-month sleep regression is real!",
        slug: "4-month-sleep-regression-real",
        content:
          "Just when I thought we were getting into a good routine, my 4-month-old has started waking up every 2 hours again! She was doing 6-hour stretches. I'm back to work in 2 weeks and I'm panicking. Please tell me this gets better?! 😭",
        tags: ["sleep-regression", "4-months", "sleep-problems"],
        isPinned: false,
        viewCount: 267,
        posts: [
          {
            author: users[7],
            content:
              "The 4-month regression is tough because it's actually a developmental leap - their sleep cycles are maturing. The good news? This is usually temporary, lasting 2-4 weeks. Keep your routine consistent, offer comfort, and try to avoid creating new sleep associations you don't want long-term. It will pass! Can your partner help with some wake-ups so you can get rest before returning to work? 💜",
          },
          {
            author: users[6],
            content:
              "I remember this! It's exhausting but it does end. Stay consistent with your bedtime routine and it will settle down.",
          },
          {
            author: users[1],
            content:
              "Sleep regressions are so hard! Remember, it's temporary. Your baby's brain is developing rapidly right now. Be patient with yourself and your baby. ❤️",
          },
        ],
      },
      // Feeding & Nutrition
      {
        category: categories[4],
        author: users[2], // emma_mom
        title: "Breastfeeding vs Formula - feeling guilty",
        slug: "breastfeeding-vs-formula-guilt",
        content:
          "I really wanted to breastfeed but I'm struggling with low supply and my baby isn't gaining weight well. My doctor has recommended supplementing with formula. I know fed is best but I can't help feeling like I'm failing. Anyone else been through this? 💔",
        tags: ["breastfeeding", "formula", "feeding"],
        isPinned: false,
        viewCount: 198,
        posts: [
          {
            author: users[1],
            content:
              "Please don't feel guilty! You are NOT failing. Feeding your baby - however you do it - is success. Some moms combo feed, some exclusively formula feed, and that's absolutely fine. Your baby needs a healthy, happy mom more than anything. You're doing the right thing by responding to medical advice. Sending you lots of love! 💕",
          },
          {
            author: users[6],
            content:
              "I exclusively formula fed by choice and my baby is thriving! There's absolutely nothing wrong with formula. Please be kind to yourself. Fed is best, always! 🍼",
          },
          {
            author: users[4],
            content:
              "I combo fed all three of mine! It worked brilliantly for us. You're making the best decision for YOUR baby and YOUR family. That's what matters!",
          },
          {
            author: users[9],
            content:
              "I could have written this post! I felt so guilty at first but now at 14 months, my happy healthy baby doesn't care how she was fed. Do what's best for you and baby. ❤️",
          },
        ],
      },
      {
        category: categories[4],
        author: users[6], // isabella_nutritionist
        title: "Starting solids: A nutritionist's guide",
        slug: "starting-solids-nutritionist-guide",
        content:
          "As a nutritionist and mom, I wanted to share some evidence-based tips for starting solids!\n\n🥄 Wait until 6 months (or when baby shows readiness signs)\n🥄 Start with iron-rich foods\n🥄 Introduce allergens early and often\n🥄 Let baby self-feed when possible\n🥄 Don't stress about mess!\n🥄 Milk is still the main nutrition source until 12 months\n\nHappy to answer any questions! What are your weaning worries?",
        tags: ["weaning", "nutrition", "solids", "baby-led-weaning"],
        isPinned: true,
        isFeatured: true,
        viewCount: 445,
        posts: [
          {
            author: users[2],
            content:
              "This is so helpful! I'm not there yet but saving this for later. What do you recommend as first foods?",
            replies: [
              {
                author: users[6],
                content:
                  "Great question! I started with avocado, sweet potato, and banana. For iron, try pureed meat, lentils, or iron-fortified baby cereal. Don't forget to offer allergens like peanut butter (thinned), egg, and fish early on!",
                replies: [
                  {
                    author: users[2],
                    content:
                      "Thank you! I didn't know about introducing allergens early. That's really helpful info!",
                  },
                  {
                    author: users[8],
                    content:
                      "This is great advice! I was so nervous about allergens but our pediatrician said the same thing.",
                  },
                ],
              },
            ],
          },
          {
            author: users[9],
            content:
              "We did baby-led weaning and loved it! Messy but so worth it. My daughter is such a good eater now at 14 months.",
            replies: [
              {
                author: users[4],
                content:
                  "I'm thinking about doing baby-led weaning with my next one. How did you deal with the choking anxiety?",
                replies: [
                  {
                    author: users[9],
                    content:
                      "I took a first aid course which really helped! And I learned the difference between gagging (normal) and choking. Gagging actually helps them learn. Just make sure foods are the right size and texture!",
                  },
                ],
              },
            ],
          },
          {
            author: users[3],
            content:
              "Thank you for this! Starting to wean my twins next month and feeling overwhelmed!",
            replies: [
              {
                author: users[6],
                content:
                  "With twins, I'd recommend batch cooking and freezing portions! It'll save you so much time. You can prep a week's worth in one session.",
              },
            ],
          },
        ],
      },
      // Development & Milestones
      {
        category: categories[5],
        author: users[9], // amelia_workingmom
        title: "She's walking! Tips for baby-proofing?",
        slug: "baby-walking-babyproofing-tips",
        content:
          "My 11-month-old just started walking and suddenly nowhere is safe! 😅 What are the essential baby-proofing items I need? I've done the basics like outlet covers and cabinet locks but what am I missing?",
        tags: ["milestones", "walking", "baby-proofing", "safety"],
        isPinned: false,
        viewCount: 176,
        posts: [
          {
            author: users[4],
            content:
              "Congratulations! So exciting! Don't forget: corner guards for furniture, door stoppers, toilet locks, and secure any furniture that could tip over to the wall. Also, move cleaning products HIGH up. They're so fast at this age!",
          },
          {
            author: users[1],
            content:
              "Gates at stairs are essential! Also check for any small objects at their level - they put EVERYTHING in their mouths. And watch out for tablecloths they can pull!",
          },
          {
            author: users[3],
            content:
              "Exciting times! We had to move everything up at least 3 feet because my twins could climb before they could walk well 😅",
          },
        ],
      },
      // Health & Medical
      {
        category: categories[6],
        author: users[5], // ava_newmom
        title: "When to worry about jaundice?",
        slug: "when-worry-about-jaundice",
        content:
          "My 10-day-old baby still looks a bit yellow, especially in her eyes. The midwife checked her at day 5 and said it was mild jaundice, but I'm worried it's not getting better. When should I be concerned? She's feeding well and having plenty of wet nappies.",
        tags: ["newborn", "jaundice", "health"],
        isPinned: false,
        viewCount: 112,
        posts: [
          {
            author: users[1],
            content:
              "Jaundice is very common in newborns and usually resolves by 2 weeks. If she's feeding well and having plenty of wet/dirty nappies, that's great! However, if you're concerned, never hesitate to call your midwife or GP. They can do a quick blood test to check bilirubin levels. Better safe than sorry! The fact she's feeding well is a good sign though. 💛",
          },
          {
            author: users[4],
            content:
              "My second had jaundice for nearly 3 weeks! Keep feeding frequently and get her checked if you're worried. Sunlight can help too - indirect sunlight through a window.",
          },
        ],
      },
      {
        category: categories[6],
        author: users[3], // olivia_twins
        title: "First fever - when to go to A&E?",
        slug: "first-fever-when-ae",
        content:
          "One of my 6-month-old twins has a temperature of 38.5°C. He seems okay, still drinking and alert, but I'm worried. Is this A&E worthy or should I wait and monitor? First time dealing with a fever and I'm panicking! 🤒",
        tags: ["fever", "illness", "emergency"],
        isPinned: false,
        viewCount: 203,
        posts: [
          {
            author: users[1],
            content:
              "Try not to panic! For babies under 3 months, any fever needs immediate medical attention. For 3-6 months, NHS guidelines say to seek medical advice if temp is 39°C or higher, or if baby is very unsettled. At 38.5°C, if he's drinking, having wet nappies, and generally okay, you can monitor for now. Give infant paracetamol if he seems uncomfortable. Call 111 if you're worried or if temp rises. Trust your instincts - if something feels wrong, get him checked! 💙",
          },
          {
            author: users[4],
            content:
              "Keep him cool (don't overdress), offer plenty of fluids, and check temp regularly. If it goes over 39°C or he becomes lethargic, get medical help. You're doing great! ❤️",
          },
          {
            author: users[6],
            content:
              "Hope he feels better soon! I always keep a thermometer and infant paracetamol handy. Better to call 111 if you're unsure!",
          },
        ],
      },
      // Parenting & Lifestyle
      {
        category: categories[7],
        author: users[9], // amelia_workingmom
        title: "Returning to work - managing the guilt",
        slug: "returning-work-managing-guilt",
        content:
          "I go back to work next week and I'm feeling so guilty about leaving my 14-month-old at nursery. I know I need to work, and she'll probably love nursery, but I can't shake this feeling. How did you cope with returning to work? Any tips for making it easier?",
        tags: ["working-mom", "childcare", "nursery"],
        isPinned: false,
        viewCount: 289,
        posts: [
          {
            author: users[4],
            content:
              "The guilt is real, but please know that you're doing what's best for your family! I went back when my eldest was 10 months and honestly, she thrived at nursery. She learned so much and made little friends. The first week was hard, but it gets easier. You're still a wonderful mom! 💕",
          },
          {
            author: users[6],
            content:
              "Working mom here too! My daughter actually loves nursery now. She's learned so much and is so social. Quality over quantity - make the time you have together really count. Bedtime routine became our special time.",
          },
          {
            author: users[1],
            content:
              "It's tough but you're showing your daughter that women can be both loving mothers AND have careers. That's a valuable lesson! Be kind to yourself. 💜",
          },
          {
            author: users[8],
            content:
              "I'm dreading this too when the time comes. Thank you for asking this question!",
          },
        ],
      },
      // Products & Reviews
      {
        category: categories[8],
        author: users[8], // charlotte_expecting
        title: "Best baby monitor recommendations?",
        slug: "best-baby-monitor-recommendations",
        content:
          "I'm starting to buy things for the nursery and overwhelmed by baby monitor options! Video or audio? WiFi or not? What do you all use and recommend? Budget around £100-150.",
        tags: ["baby-monitor", "products", "nursery"],
        isPinned: false,
        viewCount: 234,
        posts: [
          {
            author: users[3],
            content:
              "I have the Motorola MBP36S and love it! Video monitor with good night vision, room temperature display, and split screen for twins. Around £130 and no WiFi needed which I prefer for security.",
          },
          {
            author: users[9],
            content:
              "We use a WiFi camera (Owlet) so we can check on her from our phones. The app is really good. Bit pricier but worth it for us!",
          },
          {
            author: users[4],
            content:
              "Started with audio only and then upgraded to video. Video is so much better - you can see if they're actually awake or just making noise in their sleep!",
          },
        ],
      },
      {
        category: categories[8],
        author: users[2], // emma_mom
        title: "Pram recommendations for a tall mom?",
        slug: "pram-recommendations-tall-mom",
        content:
          "I'm 5'10\" and finding it hard to find a pram that doesn't hurt my back when I test them in shops. The handles seem too low! Any tall moms have recommendations for prams with adjustable/high handles?",
        tags: ["pram", "products", "reviews"],
        isPinned: false,
        viewCount: 167,
        posts: [
          {
            author: users[4],
            content:
              "I'm 5'9\" and I love the Uppababy Vista - the handlebar is adjustable and goes quite high! My husband is 6'2\" and comfortable with it too.",
          },
          {
            author: users[9],
            content:
              "Bugaboo prams have great adjustable handles! We have the Fox and both my husband (6'1\") and I (5'8\") find it comfortable.",
          },
          {
            author: users[3],
            content:
              "Check out the iCandy too - adjustable handles and really sturdy for twins if you ever need a second seat!",
          },
        ],
      },
      // Support & Community
      {
        category: categories[9],
        author: users[5], // ava_newmom
        title: "Feeling overwhelmed and lonely",
        slug: "feeling-overwhelmed-lonely",
        content:
          "Is it normal to feel so lonely? I love my baby but I feel so isolated. My partner is back at work, my family lives far away, and I don't know any other new moms. Some days I barely speak to another adult. How do you cope with this?",
        tags: ["support", "mental-health", "loneliness", "new-mom"],
        isPinned: false,
        viewCount: 312,
        posts: [
          {
            author: users[1],
            content:
              "You are not alone in feeling this way! New motherhood can be incredibly isolating. Please reach out to your health visitor about local baby groups - they're great for meeting other moms. Also, don't hesitate to talk to your GP if you're struggling - there's no shame in asking for help. This community is here for you too! 💗",
          },
          {
            author: users[4],
            content:
              "I felt exactly like this! Baby groups saved me. Even just getting out of the house for a walk helped. Please know it gets better. You're doing an amazing job! ❤️",
          },
          {
            author: users[6],
            content:
              "The loneliness is so real! I joined a local mom WhatsApp group and made some lovely friends. Also, video calls with friends helped me feel connected.",
          },
          {
            author: users[9],
            content:
              "I could have written this 12 months ago! It does get better, I promise. Be kind to yourself. You're in survival mode right now and that's okay. 💕",
          },
          {
            author: users[2],
            content:
              "Sending you a big hug! The newborn phase is so tough. You're not alone 💚",
          },
        ],
      },
    ];

    let totalThreads = 0;
    let totalPosts = 0;

    for (const threadData of threadsData) {
      const thread = await threadRepository.save({
        title: threadData.title,
        slug: threadData.slug,
        content: threadData.content,
        author: threadData.author,
        category: threadData.category,
        tags: threadData.tags,
        isPinned: threadData.isPinned || false,
        isFeatured: threadData.isFeatured || false,
        status: ThreadStatus.OPEN,
        viewCount: threadData.viewCount,
        replyCount: threadData.posts.length,
        likeCount: 0,
      });

      totalThreads++;

      // Helper function to create nested posts
      const createPostsRecursively = async (
        postsData: any[],
        parentPost: Post | null = null
      ) => {
        for (const postData of postsData) {
          const post = await postRepository.save({
            content: postData.content,
            author: postData.author,
            thread: thread,
            parentPost: parentPost,
            likeCount: 0,
            replyCount: postData.replies ? postData.replies.length : 0,
          });

          totalPosts++;

          // Update parent post's reply count
          if (parentPost) {
            parentPost.replyCount++;
            await postRepository.save(parentPost);
          }

          // Recursively create nested replies
          if (postData.replies && postData.replies.length > 0) {
            await createPostsRecursively(postData.replies, post);
          }

          // Update thread's lastPost to the most recent
          thread.lastPost = post;
          await threadRepository.save(thread);
        }
      };

      // Create posts for this thread (including nested ones)
      await createPostsRecursively(threadData.posts);

      // Update category counts
      threadData.category.threadCount++;
      threadData.category.postCount += totalPosts;
      await categoryRepository.save(threadData.category);
    }

    console.log(
      `✅ Created ${totalThreads} threads with ${totalPosts} posts\n`
    );

    // Create Reactions
    console.log("❤️  Creating reactions...");
    const reactions = [];

    // Get all posts
    const allPosts = await postRepository.find({ relations: ["author"] });

    // Add reactions from different users
    for (let i = 0; i < Math.min(50, allPosts.length * 2); i++) {
      const randomPost = allPosts[Math.floor(Math.random() * allPosts.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Don't let users react to their own posts
      if (randomPost.author.id !== randomUser.id) {
        const reactionTypes = [
          ReactionType.LIKE,
          ReactionType.LOVE,
          ReactionType.HELPFUL,
          ReactionType.FUNNY,
        ];
        const randomType =
          reactionTypes[Math.floor(Math.random() * reactionTypes.length)];

        try {
          const reaction = await reactionRepository.save({
            type: randomType,
            user: randomUser,
            post: randomPost,
          });
          reactions.push(reaction);

          // Update post like count
          randomPost.likeCount++;
          await postRepository.save(randomPost);
        } catch (error) {
          // Skip if duplicate (user already reacted to this post)
        }
      }
    }

    console.log(`✅ Created ${reactions.length} reactions\n`);

    // Update user stats
    console.log("📊 Updating user statistics...");
    for (const user of users) {
      const userThreads = await threadRepository.count({
        where: { author: { id: user.id } },
      });
      const userPosts = await postRepository.count({
        where: { author: { id: user.id } },
      });

      user.threadCount = userThreads;
      user.postCount = userPosts;
      await userRepository.save(user);
    }
    console.log("✅ User statistics updated\n");

    console.log("🎉 Database seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🏆 Badges: ${badges.length}`);
    console.log(`   📁 Categories: ${categories.length}`);
    console.log(`   💬 Threads: ${totalThreads}`);
    console.log(`   📝 Posts: ${totalPosts}`);
    console.log(`   ❤️  Reactions: ${reactions.length}`);
    console.log("\n✨ You can now login with:");
    console.log("   Email: admin@forum.com");
    console.log("   Password: password123");
    console.log("\n   Or any other user email with the same password!\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await app.close();
  }
}

seed();
