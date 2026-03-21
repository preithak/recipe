import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'

function richText(text: string) {
  const paragraphs = text.split('\n\n').filter(Boolean)
  return {
    root: {
      type: 'root' as const,
      children: paragraphs.map((p) => ({
        type: 'paragraph' as const,
        children: [{ type: 'text' as const, text: p, format: 0, detail: 0, mode: 'normal' as const, style: '', version: 1 }],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Seed only available in development' }, { status: 403 })
  }

  const payload = await getPayload()
  const log: string[] = []

  // Create admin user
  const existingUsers = await payload.find({ collection: 'users', limit: 1, overrideAccess: true })
  if (existingUsers.docs.length === 0) {
    await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: { email: 'admin@reciepie.com', password: 'admin123', name: 'Admin', role: 'admin' },
    })
    log.push('Created admin user: admin@reciepie.com / admin123')
  } else {
    log.push('Admin user already exists')
  }

  // Create categories
  const categoryNames = ['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Snacks']
  const categories: Record<string, number | string> = {}
  for (const name of categoryNames) {
    const existing = await payload.find({ collection: 'categories', where: { slug: { equals: name.toLowerCase() } }, limit: 1 })
    if (existing.docs.length > 0) {
      categories[name] = existing.docs[0].id
      continue
    }
    const cat = await payload.create({ collection: 'categories', overrideAccess: true, data: { name, slug: name.toLowerCase() } })
    categories[name] = cat.id
    log.push(`Created category: ${name}`)
  }

  // Create tags
  const tagDefs = ['Vegan', 'Quick', 'Comfort Food', 'Seasonal', 'Gluten-Free', 'One-Pot']
  const tags: Record<string, number | string> = {}
  for (const name of tagDefs) {
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    const existing = await payload.find({ collection: 'tags', where: { slug: { equals: slug } }, limit: 1 })
    if (existing.docs.length > 0) {
      tags[name] = existing.docs[0].id
      continue
    }
    const tag = await payload.create({ collection: 'tags', overrideAccess: true, data: { name, slug } })
    tags[name] = tag.id
    log.push(`Created tag: ${name}`)
  }

  // Recipes
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
        { instruction: richText('On a separate baking sheet, toss chickpeas with remaining olive oil and a pinch of salt. Roast both sheets for 25-30 minutes, shaking halfway through.') },
        { instruction: richText('Whisk together tahini, maple syrup, lemon juice, and minced garlic. Add warm water one tablespoon at a time until pourable.') },
        { instruction: richText('Divide farro among bowls. Top with kale, roasted squash, crispy chickpeas, pomegranate seeds, and pumpkin seeds. Drizzle with dressing.'), tip: 'The warm squash will slightly wilt the kale, which is exactly what you want.' },
      ],
      showNutrition: true,
      nutrition: { calories: 420, protein: 14, carbs: 52, fat: 18, fiber: 9 },
      body: richText('This bowl is inspired by the farmers market abundance of autumn. The combination of sweet roasted squash, earthy farro, and tangy pomegranate creates a dish that feels both wholesome and celebratory.'),
      publishedAt: new Date().toISOString(),
      _status: 'published' as const,
    },
    {
      title: 'Classic Sourdough Bread',
      slug: 'classic-sourdough-bread',
      description: 'A beautifully crusty sourdough with an open, tangy crumb. Uses a mature starter and slow cold ferment for maximum flavor.',
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
        { instruction: richText('Mix flour and water until no dry flour remains. Cover and rest 30 minutes (autolyse).'), tip: 'The autolyse is not optional — it dramatically improves crumb structure.' },
        { instruction: richText('Add starter and salt. Squeeze and fold until incorporated, about 3-4 minutes.') },
        { instruction: richText('Over 4 hours, perform stretch and folds every 30 minutes (8 sets). For each set, grab one side, stretch up, fold over center. Rotate 90° and repeat 4 times.') },
        { instruction: richText('Let bulk ferment at room temperature until grown by about 50% and feels light and airy.') },
        { instruction: richText('Pre-shape into a loose round, rest 20 minutes. Final shape: fold edges to center, flip seam-side down, build surface tension. Place seam-side up in a floured banneton.') },
        { instruction: richText('Cover and refrigerate overnight (8-14 hours) for cold retard.') },
        { instruction: richText('Preheat oven to 500°F with Dutch oven inside for 45 minutes. Score dough, lower into pot. Cover and bake 20 min, then uncover 20-25 min until deep golden.'), tip: 'The steam trapped by the lid gives sourdough its signature blistered crust.' },
        { instruction: richText('Cool completely on a wire rack — at least 1 hour before slicing.') },
      ],
      showNutrition: true,
      nutrition: { calories: 140, protein: 5, carbs: 28, fat: 1, fiber: 1 },
      body: richText('There is something deeply satisfying about pulling a golden loaf from the oven, knowing it began as just flour, water, and wild yeast. Sourdough baking teaches patience.'),
      publishedAt: new Date().toISOString(),
      _status: 'published' as const,
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
          ],
        },
      ],
      steps: [
        { instruction: richText('Bring a large pot of salted water to a boil. Clean mushrooms with a damp paper towel.'), tip: 'Tear larger mushrooms by hand — rough edges create more surface area for browning.' },
        { instruction: richText('Heat oil and 1 tbsp butter over high heat. Add mushrooms in a single layer, cook without stirring 3-4 minutes until golden. Toss and cook 2 more minutes.') },
        { instruction: richText('Reduce heat. Add remaining butter, garlic, and thyme. Cook 1 minute. Deglaze with wine, reduce by half.') },
        { instruction: richText('Cook pappardelle until just al dente. Reserve 1 cup pasta water before draining.') },
        { instruction: richText('Add cream to mushrooms, then drained pasta and a splash of pasta water. Toss vigorously over medium heat for 1 minute until sauce coats every ribbon.') },
        { instruction: richText('Remove from heat, fold in half the Parmesan. Season and serve with remaining Parmesan.') },
      ],
      showNutrition: true,
      nutrition: { calories: 485, protein: 16, carbs: 54, fat: 22, fiber: 3 },
      body: richText('This is the dish we make when we want something luxurious that comes together in under 30 minutes. The key is not rushing the mushrooms — give them space and heat.'),
      publishedAt: new Date().toISOString(),
      _status: 'published' as const,
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
          ],
        },
      ],
      steps: [
        { instruction: richText('Whisk flour, sugar, and salt. Work in cold butter until you have pea-sized pieces. Drizzle in ice water until dough holds together.'), tip: 'Visible butter pieces create the flaky layers.' },
        { instruction: richText('Shape into a flat disk, wrap, and refrigerate at least 1 hour.') },
        { instruction: richText('Preheat oven to 400°F. Gently toss berries with sugar, cornstarch, lemon juice, and vanilla.') },
        { instruction: richText('Roll chilled dough into a rough 14-inch circle on floured parchment.') },
        { instruction: richText('Mound berry filling in the center leaving a 2-inch border. Fold edges up over the fruit, pleating as you go. Brush crust with egg wash and sprinkle with turbinado sugar.') },
        { instruction: richText('Bake 38-42 minutes until deeply golden and bubbling. Cool at least 20 minutes before slicing.') },
      ],
      showNutrition: true,
      nutrition: { calories: 245, protein: 3, carbs: 34, fat: 12, fiber: 2 },
      body: richText('The galette is proof that the most beautiful desserts are often the most forgiving. Unlike a pie, there is no fussy crimping. You roll, fill, fold, and bake.'),
      publishedAt: new Date().toISOString(),
      _status: 'published' as const,
    },
  ]

  for (const recipe of recipes) {
    const existing = await payload.find({ collection: 'recipes', where: { slug: { equals: recipe.slug } }, limit: 1 })
    if (existing.docs.length > 0) {
      log.push(`Recipe already exists: ${recipe.title}`)
      continue
    }
    await payload.create({ collection: 'recipes', overrideAccess: true, data: recipe })
    log.push(`Created recipe: ${recipe.title}`)
  }

  // Blog post
  const existingPost = await payload.find({ collection: 'blog-posts', where: { slug: { equals: 'the-art-of-slow-cooking' } }, limit: 1 })
  if (existingPost.docs.length === 0) {
    await payload.create({
      collection: 'blog-posts',
      overrideAccess: true,
      data: {
        title: 'The Art of Slow Cooking',
        slug: 'the-art-of-slow-cooking',
        excerpt: 'In a world that moves too fast, there is radical joy in a dish that takes all day. Here is why we believe in the low-and-slow approach.',
        content: richText('There is a kind of alchemy that happens when food is given time. A tough cut of beef transforms into something that falls apart at the touch of a fork. Onions melt into a sweet, jammy base. Even water becomes a rich, layered broth.\n\nSlow cooking is not about efficiency. It is about trust. Trust that the heat will do its work. Trust that flavor develops in its own time.\n\nWe have become a kitchen that plans around the Dutch oven. Sunday mornings start with something going into a pot — a ragu, a braise, a soup — and by evening, the house smells like the kind of place you never want to leave.'),
        category: categories['Dinner'],
        tags: [tags['Comfort Food']],
        _status: 'published' as const,
        publishedAt: new Date().toISOString(),
      },
    })
    log.push('Created blog post: The Art of Slow Cooking')
  }

  return NextResponse.json({ success: true, log })
}
