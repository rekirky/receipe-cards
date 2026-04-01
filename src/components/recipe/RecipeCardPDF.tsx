import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Recipe } from '../../types'

const CHARCOAL_DARK = '#1c1917'
const CHARCOAL_MID = '#44403c'
const CHARCOAL_LIGHT = '#78716c'
const WHITE = '#ffffff'
const OFF_WHITE = '#f5f5f4'

function makeStyles(ember: string) {
  return StyleSheet.create({
    page: { backgroundColor: CHARCOAL_DARK, fontFamily: 'Helvetica', padding: 0 },
    headerBand: {
      backgroundColor: '#0c0a09',
      paddingHorizontal: 40, paddingTop: 36, paddingBottom: 24,
      borderBottomWidth: 3, borderBottomColor: ember,
    },
    categoryPill: {
      backgroundColor: ember, borderRadius: 10,
      paddingHorizontal: 8, paddingVertical: 3,
      alignSelf: 'flex-start', marginBottom: 8,
    },
    categoryText: { color: WHITE, fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
    recipeName: { color: WHITE, fontSize: 32, fontWeight: 700, letterSpacing: 2, marginBottom: 4 },
    tagline: { color: '#a8a29e', fontSize: 11, fontStyle: 'italic' },
    body: { paddingHorizontal: 40, paddingVertical: 28, flexDirection: 'row', gap: 24 },
    leftCol: { flex: 2 },
    sectionLabel: { color: ember, fontSize: 7, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
    description: { color: '#d6d3d1', fontSize: 10, lineHeight: 1.6, marginBottom: 20 },
    storageBox: { backgroundColor: CHARCOAL_MID, borderRadius: 6, padding: 10, marginTop: 4 },
    storageText: { color: '#d6d3d1', fontSize: 9, lineHeight: 1.5 },
    yieldRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
    yieldLabel: { color: CHARCOAL_LIGHT, fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginRight: 6 },
    yieldValue: { color: ember, fontSize: 11, fontWeight: 700 },
    rightCol: { flex: 3 },
    ingredientRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: CHARCOAL_MID, paddingVertical: 7 },
    ingredientName: { flex: 1, color: OFF_WHITE, fontSize: 10 },
    ingredientNotes: { flex: 1, color: CHARCOAL_LIGHT, fontSize: 8, fontStyle: 'italic' },
    ingredientAmount: { color: ember, fontSize: 10, fontWeight: 700, fontFamily: 'Helvetica-Bold', minWidth: 50, textAlign: 'right' },
    footer: { marginTop: 'auto', paddingHorizontal: 40, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerText: { color: CHARCOAL_LIGHT, fontSize: 7 },
  })
}

interface Props {
  recipe: Recipe
  themeColour: string
  categoryLabel: string
}

export default function RecipeCardPDF({ recipe, themeColour, categoryLabel }: Props) {
  const styles = makeStyles(themeColour)

  return (
    <Document title={recipe.name} author="Recipe Cards">
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.headerBand}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>
          <Text style={styles.recipeName}>{recipe.name.toUpperCase()}</Text>
          <Text style={styles.tagline}>{recipe.tagline}</Text>
        </View>

        <View style={styles.body}>
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
              <Text style={styles.yieldValue}>{recipe.yieldAmount}{recipe.yieldUnit}</Text>
            </View>
          </View>

          <View style={styles.rightCol}>
            <Text style={styles.sectionLabel}>Ingredients — {recipe.ingredients.length} components</Text>
            {recipe.ingredients.map((ing) => (
              <View key={ing.name} style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>{ing.name}</Text>
                <Text style={styles.ingredientNotes}>{ing.notes ?? ''}</Text>
                <Text style={styles.ingredientAmount}>{ing.amount} {ing.unit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Recipe Card</Text>
        </View>
      </Page>
    </Document>
  )
}
