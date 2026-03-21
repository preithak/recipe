import { getPayload } from 'payload'
import config from '../payload.config'

async function seed() {
  const payload = await getPayload({ config })

  // Create admin user
  let adminUser
  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  if (existingUsers.docs.length === 0) {
    adminUser = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@reciepie.com',
        password: 'admin123',
        name: 'Admin',
        role: 'admin',
      },
    })
    console.log('Created admin user:', adminUser.email)
  } else {
    adminUser = existingUsers.docs[0]
    console.log('Admin user already exists:', adminUser.email)
  }

  // Create categories
  const categoryNames = ['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Snacks']
  const categories: Record<string, string> = {}

  for (const name of categoryNames) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: name.toLowerCase() } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      categories[name] = existing.docs[0].id as string
      continue
    }
    const cat = await payload.create({
      collection: 'categories',
      data: { name, slug: name.toLowerCase() },
    })
    categories[name] = cat.id as string
    console.log('Created category:', name)
  }

  // Create tags
  const tagNames = ['Vegan', 'Quick', 'Comfort Food', 'Seasonal', 'Gluten-Free', 'One-Pot']
  const tags: Record<string, string> = {}

  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    const existing = await payload.find({
      collection: 'tags',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      tags[name] = existing.docs[0].id as string
      continue
    }
    const tag = await payload.create({
      collection: 'tags',
      data: { name, slug },
    })
    tags[name] = tag.id as string
    console.log('Created tag:', name)
  }

  // Seed recipes
  const recipes = [
    {
      title: 'Autumn Harvest Bowl',
      slug: 'autumn-harvest-bowl',
      description: 'A nourishing grain bowl with roasted butternut squash, crispy chickpeas, pomegranate seeds, and a tahini-maple dressing that captures the essence of fall.',
      category: categories['Lunch'],
      tags: [tags['Vegan'], tags['Seasonal']],
      metadata: { prepTime: 15, cookTime: 35, servings: 4, difficulty: 'easy' as const, cuisine: 'Mediterranean' },
      ingredientGroups: [
        {
          groupName: 'For the bowl',
          ingredients: [
            { quantity: '1', unit: 'medium', item: 'butternut squash', notes: 'peeled and cubed' },
            { quantity: '1', unit: 'can', item: 'chickpeas', notes: 'drained and rinsed' },
            { quantity: '2', unit: 'cups', item: 'cooked farro' },
            { quantity: '2', unit: 'cups', item: 'baby kale' },
            { quantity: '1/2', unit: 'cup', item: 'pomegranate seeds' },
            { quantity: '1/4', unit: 'cup', item: 'toasted pumpkin seeds' },
            { quantity: '2', unit: 'tbsp', item: 'olive oil' },
            { quantity: '1', unit: 'tsp', item: 'smoked paprika' },
            { quantity: '', unit: '', item: 'salt and pepper', notes: 'to taste' },
          ],
        },
        {
          groupName: 'For the tahini-maple dressing',
          ingredients: [
            { quantity: '3', unit: 'tbsp', item: 'tahini' },
            { quantity: '1', unit: 'tbsp', item: 'maple syrup' },
            { quantity: '2', unit: 'tbsp', item: 'lemon juice' },
            { quantity: '1', unit: 'clove', item: 'garlic', notes: 'minced' },
            { quantity: '2-3', unit: 'tbsp', item: 'warm water' },
          ],
        },
      ],
      steps: [
        { instruction: richText('Preheat oven to 425°F (220°C). Toss butternut squash cubes with 1 tablespoon olive oil, smoked paprika, salt, and pepper. Spread on a baking sheet.'), tip: 'Cut squash into even 1-inch cubes for uniform roasting.' },
        { instruction: richText('On a separate baking sheet, toss chickpeas with remaining olive oil and a pinch of salt. Roast both sheets for 25-30 minutes, shaking halfway through, until squash is tender and chickpeas are golden and crispy.') },
        { instruction: richText('While everything roasts, whisk together tahini, maple syrup, lemon juice, and minced garlic. Add warm water one tablespoon at a time until you reach a pourable consistency.') },
        { instruction: richText('Divide farro among bowls. Top with baby kale, roasted squash, crispy chickpeas, pomegranate seeds, and pumpkin seeds. Drizzle generously with tahini-maple dressing.'), tip: 'The warm squash will slightly wilt the kale, which is exactly what you want.' },
      ],
      showNutrition: true,
      nutrition: { calories: 420, protein: 14, carbs: 52, fat: 18, fiber: 9 },
      body: richText('This bowl is inspired by the farmers market abundance of autumn. The combination of sweet roasted squash, earthy farro, and tangy pomegranate creates a dish that feels both wholesome and celebratory. It\'s become our go-to weeknight dinner when the evenings turn cool.'),
    },
    {
      title: 'Classic Sourdough Bread',
      slug: 'classic-sourdough-bread',
      description: 'A beautifully crusty sourdough with an open, tangy crumb. This recipe uses a mature starter and a slow cold ferment for maximum flavor development.',
      category: categories['Breakfast'],
      tags: [tags['Comfort Food']],
      metadata: { prepTime: 30, cookTime: 45, servings: 1, difficulty: 'hard' as const, cuisine: 'French' },
      ingredientGroups: [
        {
          groupName: 'For the dough',
          ingredients: [
            { quantity: '500', unit: 'g', item: 'bread flour' },
            { quantity: '350', unit: 'g', item: 'water', notes: 'room temperature' },
            { quantity: '100', unit: 'g', item: 'sourdough starter', notes: 'active and bubbly' },
            { quantity: '10', unit: 'g', item: 'salt' },
          ],
        },
      ],
      steps: [
        { instruction: richText('Mix flour and water in a large bowl until no dry flour remains. Cover and let rest for 30 minutes (autolyse). This allows the flour to fully hydrate and begin developing gluten.'), tip: 'The autolyse is not optional — it dramatically improves the crumb structure.' },
        { instruction: richText('Add the active starter and salt to the dough. Squeeze and fold until fully incorporated, about 3-4 minutes. The dough will feel shaggy at first but will come together.') },
        { instruction: richText('Over the next 4 hours, perform a set of stretch and folds every 30 minutes (8 sets total). For each set, wet your hand, grab one side of the dough, stretch it up, and fold it over the center. Rotate the bowl 90° and repeat 4 times.') },
        { instruction: richText('After the last fold, cover the dough and let it bulk ferment at room temperature until it has grown by about 50% and feels light and airy. This could take 1-3 hours depending on your kitchen temperature.') },
        { instruction: richText('Gently turn the dough onto a lightly floured surface. Pre-shape into a loose round and let rest 20 minutes. Then do a final shape: fold the edges into the center, flip seam-side down, and use the counter to create surface tension. Place seam-side up in a floured banneton.') },
        { instruction: richText('Cover and refrigerate overnight (8-14 hours) for a cold retard. This develops the signature tangy sourdough flavor.') },
        { instruction: richText('Preheat oven to 500°F (260°C) with a Dutch oven inside for at least 45 minutes. Turn the dough onto parchment paper, score with a sharp blade, and carefully lower into the hot Dutch oven. Cover and bake 20 minutes, then remove lid and bake another 20-25 minutes until deep golden brown.'), tip: 'The steam trapped by the lid is what gives sourdough its signature blistered crust.' },
        { instruction: richText('Let the bread cool completely on a wire rack — at least 1 hour — before slicing. The interior is still cooking as it cools.') },
      ],
      showNutrition: true,
      nutrition: { calories: 140, protein: 5, carbs: 28, fat: 1, fiber: 1 },
      body: richText('There is something deeply satisfying about pulling a golden loaf from the oven, knowing it began as just flour, water, and wild yeast. Sourdough baking teaches patience — the dough tells you when it\'s ready, not the other way around. This recipe has been refined over dozens of bakes.'),
    },
    {
      title: 'Wild Mushroom Pappardelle',
      slug: 'wild-mushroom-pappardelle',
      description: 'Wide ribbons of pasta tossed with a medley of wild mushrooms, garlic, thyme, and a splash of cream. Simple, earthy, and deeply satisfying.',
      category: categories['Dinner'],
      tags: [tags['Quick'], tags['Comfort Food']],
      metadata: { prepTime: 10, cookTime: 20, servings: 4, difficulty: 'easy' as const, cuisine: 'Italian' },
      ingredientGroups: [
        {
          groupName: '',
          ingredients: [
            { quantity: '400', unit: 'g', item: 'pappardelle pasta' },
            { quantity: '500', unit: 'g', item: 'mixed wild mushrooms', notes: 'chanterelle, oyster, shiitake' },
            { quantity: '4', unit: 'cloves', item: 'garlic', notes: 'thinly sliced' },
            { quantity: '3', unit: 'tbsp', item: 'butter' },
            { quantity: '2', unit: 'tbsp', item: 'olive oil' },
            { quantity: '1/3', unit: 'cup', item: 'dry white wine' },
            { quantity: '1/4', unit: 'cup', item: 'heavy cream' },
            { quantity: '4', unit: 'sprigs', item: 'fresh thyme' },
            { quantity: '1/2', unit: 'cup', item: 'Parmesan', notes: 'freshly grated' },
            { quantity: '', unit: '', item: 'salt, pepper, and chili flakes', notes: 'to taste' },
          ],
        },
      ],
      steps: [
        { instruction: richText('Bring a large pot of well-salted water to a boil. Clean the mushrooms by brushing off any dirt with a damp paper towel — never soak them, or they\'ll become waterlogged.'), tip: 'Tear larger mushrooms by hand rather than cutting. The rough edges create more surface area for browning.' },
        { instruction: richText('Heat olive oil and 1 tablespoon butter in a large skillet over high heat. Add mushrooms in a single layer — work in batches if needed, don\'t crowd the pan. Cook without stirring for 3-4 minutes until golden underneath, then toss and cook another 2 minutes.') },
        { instruction: richText('Reduce heat to medium. Add remaining butter, garlic, and thyme sprigs. Cook for 1 minute until fragrant. Deglaze with white wine and let it reduce by half, about 2 minutes.') },
        { instruction: richText('Meanwhile, cook pappardelle until just al dente (1 minute less than package directions). Reserve 1 cup of pasta water before draining.') },
        { instruction: richText('Add cream to the mushrooms and stir. Add the drained pasta and a splash of pasta water. Toss vigorously over medium heat for 1 minute — the starchy water and cream will form a silky sauce that coats every ribbon. Add more pasta water if needed.') },
        { instruction: richText('Remove from heat, discard thyme sprigs, and fold in half the Parmesan. Season with salt, pepper, and a pinch of chili flakes. Serve immediately with remaining Parmesan on top.') },
      ],
      showNutrition: true,
      nutrition: { calories: 485, protein: 16, carbs: 54, fat: 22, fiber: 3 },
      body: richText('This is the dish we make when we want something that feels luxurious but comes together in under 30 minutes. The key is not rushing the mushrooms — give them space and heat, and they\'ll reward you with deep, caramelized flavor.'),
    },
    {
      title: 'Summer Berry Galette',
      slug: 'summer-berry-galette',
      description: 'A rustic free-form tart with a flaky butter crust and a tumble of mixed berries. Imperfect by design, stunning by nature.',
      category: categories['Desserts'],
      tags: [tags['Seasonal']],
      metadata: { prepTime: 20, cookTime: 40, servings: 8, difficulty: 'medium' as const, cuisine: 'French' },
      ingredientGroups: [
        {
          groupName: 'For the crust',
          ingredients: [
            { quantity: '1 1/2', unit: 'cups', item: 'all-purpose flour' },
            { quantity: '1', unit: 'tbsp', item: 'sugar' },
            { quantity: '1/2', unit: 'tsp', item: 'salt' },
            { quantity: '1/2', unit: 'cup', item: 'cold unsalted butter', notes: 'cubed' },
            { quantity: '4-5', unit: 'tbsp', item: 'ice water' },
          ],
        },
        {
          groupName: 'For the filling',
          ingredients: [
            { quantity: '3', unit: 'cups', item: 'mixed berries', notes: 'blueberries, raspberries, blackberries' },
            { quantity: '1/3', unit: 'cup', item: 'sugar' },
            { quantity: '2', unit: 'tbsp', item: 'cornstarch' },
            { quantity: '1', unit: 'tbsp', item: 'lemon juice' },
            { quantity: '1', unit: 'tsp', item: 'vanilla extract' },
            { quantity: '1', unit: '', item: 'egg', notes: 'beaten, for egg wash' },
            { quantity: '1', unit: 'tbsp', item: 'turbinado sugar', notes: 'for sprinkling' },
          ],
        },
      ],
      steps: [
        { instruction: richText('Make the crust: whisk flour, sugar, and salt together. Add cold butter cubes and use a pastry cutter or your fingers to work the butter into the flour until you have a mix of pea-sized and flattened pieces. Drizzle in ice water one tablespoon at a time, mixing with a fork, until the dough just holds together.'), tip: 'Visible butter pieces are your friend — they create the flaky layers.' },
        { instruction: richText('Shape dough into a flat disk, wrap in plastic, and refrigerate for at least 1 hour.') },
        { instruction: richText('Preheat oven to 400°F (200°C). In a bowl, gently toss berries with sugar, cornstarch, lemon juice, and vanilla.') },
        { instruction: richText('Roll the chilled dough into a rough 14-inch circle on floured parchment paper. It doesn\'t need to be perfect — that\'s the beauty of a galette. Transfer parchment and dough to a baking sheet.') },
        { instruction: richText('Mound the berry filling in the center of the dough, leaving a 2-inch border. Fold the edges up and over the fruit, pleating as you go. The center stays open. Brush the crust with beaten egg and sprinkle with turbinado sugar.') },
        { instruction: richText('Bake for 38-42 minutes until the crust is deeply golden and the filling is bubbling. Let cool at least 20 minutes before slicing — the juices need time to set.') },
      ],
      showNutrition: true,
      nutrition: { calories: 245, protein: 3, carbs: 34, fat: 12, fiber: 2 },
      body: richText('The galette is proof that the most beautiful desserts are often the most forgiving. Unlike a pie, there is no fussy crimping or blind baking. You just roll, fill, fold, and bake. Every galette looks different, and that is exactly the point.'),
    },
  ]

  for (const recipe of recipes) {
    const existing = await payload.find({
      collection: 'recipes',
      where: { slug: { equals: recipe.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      console.log('Recipe already exists:', recipe.title)
      continue
    }

    await payload.create({
      collection: 'recipes',
      data: {
        ...recipe,
        _status: 'published',
        publishedAt: new Date().toISOString(),
      },
    })
    console.log('Created recipe:', recipe.title)
  }

  // Create a blog post
  const existingPost = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: 'the-art-of-slow-cooking' } },
    limit: 1,
  })
  if (existingPost.docs.length === 0) {
    await payload.create({
      collection: 'blog-posts',
      data: {
        title: 'The Art of Slow Cooking',
        slug: 'the-art-of-slow-cooking',
        excerpt: 'In a world that moves too fast, there is radical joy in a dish that takes all day. Here is why we believe in the low-and-slow approach to cooking.',
        content: richText('There is a kind of alchemy that happens when food is given time. A tough cut of beef, unpromising and sinewy, transforms into something that falls apart at the touch of a fork. Onions, harsh and tear-inducing, melt into a sweet, jammy base. Even water becomes something more — a rich, layered broth that carries the memory of every ingredient that simmered in it.\n\nSlow cooking is not about efficiency. It is about trust. Trust that the heat will do its work. Trust that flavor develops in its own time. Trust that the best meals are not the ones that happen fastest, but the ones that happen most completely.\n\nWe have become a kitchen that plans around the slow cooker and the Dutch oven. Sunday mornings start with something going into a pot — a ragu, a braise, a soup — and by evening, the house smells like the kind of place you never want to leave.'),
        category: categories['Dinner'],
        tags: [tags['Comfort Food']],
        _status: 'published',
        publishedAt: new Date().toISOString(),
      },
    })
    console.log('Created blog post: The Art of Slow Cooking')
  }

  console.log('\nSeeding complete!')
  process.exit(0)
}

function richText(text: string) {
  const paragraphs = text.split('\n\n').filter(Boolean)
  return {
    root: {
      type: 'root',
      children: paragraphs.map((p) => ({
        type: 'paragraph',
        children: [{ type: 'text', text: p, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

seed().catch(console.error)
