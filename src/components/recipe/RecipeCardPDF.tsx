import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { Recipe } from '../../types'
import { CATEGORY_LABELS } from '../../data/recipes'

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 700,
    },
  ],
})

const EMBER = '#ea580c'
const CHARCOAL_DARK = '#1c1917'
const CHARCOAL_MID = '#44403c'
const CHARCOAL_LIGHT = '#78716c'
const WHITE = '#ffffff'
const OFF_WHITE = '#f5f5f4'

const styles = StyleSheet.create({
  page: {
    backgroundColor: CHARCOAL_DARK,
    fontFamily: 'Inter',
    padding: 0,
  },
  // Top header band
  headerBand: {
    backgroundColor: '#0c0a09',
    paddingHorizontal: 40,
    paddingTop: 36,
    paddingBottom: 24,
    borderBottomWidth: 3,
    borderBottomColor: EMBER,
  },
  categoryPill: {
    backgroundColor: EMBER,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    color: WHITE,
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  recipeName: {
    color: WHITE,
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: 2,
    marginBottom: 4,
  },
  tagline: {
    color: '#a8a29e',
    fontSize: 11,
    fontStyle: 'italic',
  },
  // Body
  body: {
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: 'row',
    gap: 24,
  },
  // Left column — description + storage
  leftCol: {
    flex: 2,
  },
  sectionLabel: {
    color: EMBER,
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  description: {
    color: '#d6d3d1',
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  storageBox: {
    backgroundColor: CHARCOAL_MID,
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  storageText: {
    color: '#d6d3d1',
    fontSize: 9,
    lineHeight: 1.5,
  },
  yieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  yieldLabel: {
    color: CHARCOAL_LIGHT,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginRight: 6,
  },
  yieldValue: {
    color: EMBER,
    fontSize: 11,
    fontWeight: 700,
  },
  // Right column — ingredients
  rightCol: {
    flex: 3,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: CHARCOAL_MID,
    paddingVertical: 7,
  },
  ingredientName: {
    flex: 1,
    color: OFF_WHITE,
    fontSize: 10,
  },
  ingredientNotes: {
    flex: 1,
    color: CHARCOAL_LIGHT,
    fontSize: 8,
    fontStyle: 'italic',
  },
  ingredientAmount: {
    color: EMBER,
    fontSize: 10,
    fontWeight: 700,
    fontFamily: 'Inter',
    minWidth: 50,
    textAlign: 'right',
  },
  // Footer
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 40,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: CHARCOAL_LIGHT,
    fontSize: 7,
  },
})

interface Props {
  recipe: Recipe
}

export default function RecipeCardPDF({ recipe }: Props) {
  const categoryLabel = CATEGORY_LABELS[recipe.category] ?? recipe.category

  return (
    <Document title={recipe.name} author="Recipe Cards">
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.headerBand}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>
          <Text style={styles.recipeName}>{recipe.name.toUpperCase()}</Text>
          <Text style={styles.tagline}>{recipe.tagline}</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Left */}
          <View style={styles.leftCol}>
            <Text style={styles.sectionLabel}>About This Blend</Text>
            <Text style={styles.description}>{recipe.description}</Text>

            {recipe.storageNotes && (
              <>
                <Text style={styles.sectionLabel}>Storage</Text>
                <View style={styles.storageBox}>
                  <Text style={styles.storageText}>{recipe.storageNotes}</Text>
                </View>
              </>
            )}

            <View style={styles.yieldRow}>
              <Text style={styles.yieldLabel}>Batch Yield:</Text>
              <Text style={styles.yieldValue}>
                {recipe.yieldAmount}
                {recipe.yieldUnit}
              </Text>
            </View>
          </View>

          {/* Right */}
          <View style={styles.rightCol}>
            <Text style={styles.sectionLabel}>
              Ingredients — {recipe.ingredients.length} components
            </Text>
            {recipe.ingredients.map((ing) => (
              <View key={ing.name} style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>{ing.name}</Text>
                <Text style={styles.ingredientNotes}>{ing.notes ?? ''}</Text>
                <Text style={styles.ingredientAmount}>
                  {ing.amount} {ing.unit}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Recipe Card</Text>
        </View>
      </Page>
    </Document>
  )
}
